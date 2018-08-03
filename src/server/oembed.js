import { Router } from 'express';
import cors from 'cors';
import xml from 'xml';

import * as OiceAPI from '../common/api/oice';

import { OICE_VIEW_URL_BASE } from '../common/constants';
import { ValidationError } from '../common/utils/validation';

const router = Router();
const { URL } = require('url');

const DEBUG = process.env.NODE_ENV !== 'production';

router.use(cors());
router.get('/', async (req, res, next) => {
  try {
    const { url, maxwidth, maxheight } = req.query;
    if (!url) {
      throw new ValidationError('No url query in oEmbed request');
    }

    const domain = ['oice.com'];
    const queryUrlRegexp = new RegExp(`^(?:https?:\\/\\/)?(${domain.join('|')})\\/story/([0-9a-f]{32})/?`);
    const urlMatch = queryUrlRegexp.exec(url);
    if (!urlMatch) {
      throw new ValidationError(`Invalid url query (${url}) in oEmbed request`);
    }

    const oiceUuid = urlMatch[2];
    const format = req.query.format || 'json';
    if (!['json', 'xml'].includes(format)) {
      throw new ValidationError(`Invalid format ${format} in oEmbed request`);
    }

    const DEFAULT_MAX_SIZE = 600;
    const maxWidth = Number.parseInt(maxwidth, 10) || DEFAULT_MAX_SIZE;
    const maxHeight = Number.parseInt(maxheight, 10) || DEFAULT_MAX_SIZE;
    const thumbnailLength = Math.min(300, maxWidth, maxHeight);

    let oice;
    try {
      oice = await OiceAPI.fetchOiceOgByUUID(oiceUuid);
    } catch (err) {
      console.error(err);
    }
    if (!oice) {
      res.sendStatus(404);
      return;
    }

    const searchParams = new URL(url).search;
    const iframeSrc = `${OICE_VIEW_URL_BASE}/view/${oiceUuid}${searchParams}`;
    const baseURL = `${DEBUG ? 'http' : 'https'}://${req.get('host')}`;
    const oEmbedResponse = {
      type: 'rich',
      version: '1.0',
      title: oice.ogTitle || oice.name,
      url,
      thumbnail_url: oice.storyCover || `${baseURL}/static/img/oice-default-cover.jpg`,
      thumbnail_width: thumbnailLength,
      thumbnail_height: thumbnailLength,
      html: `<iframe width="${maxWidth}" height="${maxHeight}" src="${iframeSrc}" ` +
              ' frameborder="0" allow="autoplay" scrolling="no"></iframe>',
      provider_name: 'oice',
      provider_url: baseURL,
      width: maxWidth,
      height: maxHeight,
    };
    switch (format) {
      case 'json':
        res.json(oEmbedResponse);
        break;
      case 'xml': {
        res.set('Content-Type', 'text/xml');
        const xmlArray = Object.keys(oEmbedResponse).map(key => ({ [key]: oEmbedResponse[key] }));
        res.send(xml({ oembed: xmlArray }, { declaration: { encoding: 'utf-8', standalone: 'yes' } }));
        break;
      }
      default:
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});


function errorHandler(err, req, res, next) {
  const msg = (err.response && err.response.data) || err.message || err;
  if (err.name === 'ValidationError') {
    return res.status(400).send(msg);
  }

  return res.sendStatus(500);
}
router.use(errorHandler);

export default router;
