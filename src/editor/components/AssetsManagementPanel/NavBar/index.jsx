import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Link from 'react-router/lib/Link';

import NavBar from 'ui-elements/NavBar';
import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import ArrowRightIcon from 'common/icons/arrow/right';

import './styles.scss';


@translate()
@connect((store) => ({
  library: store.libraryPanel.selectedLibrary,
  oice: store.oices.selected,
  story: store.stories.selected,
  user: store.user,
}))
export default class AssetNavBar extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    library: PropTypes.object,
    oice: PropTypes.object,
    story: PropTypes.object,
    user: PropTypes.object,
  };

  render() {
    const { library, oice, story, t, user } = this.props;

    return (
      <NavBar id="assets-management-nav-bar" showLogo={false} user={user}>
        <ul className="assets-management-nav-bar-breadcrumb">
          <li>
            <Link to={story && oice ? `/story/${story.id}/oice/${oice.id}` : '/dashboard'}>
              {t('editor:title')}
            </Link>
          </li>
          <li>
            <ArrowRightIcon />
            {library &&
              <Link to={story && oice ? `/story/${story.id}/assets` : '/library'}>
                {t('assetsManagement:title')}
              </Link>
            }
            {!library && t('assetsManagement:title')}
          </li>
          {library &&
            <li>
              <ArrowRightIcon />
              {library.name}
            </li>
          }
        </ul>
      </NavBar>
    );
  }
}
