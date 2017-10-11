import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import './styles.scss';

const MAX_NUMBER_OF_PAGES_SHOW = 5;
const NUMBER_OF_FRONT_PAGES = MAX_NUMBER_OF_PAGES_SHOW / 2;
const NUMBER_OF_BACK_PAGES = MAX_NUMBER_OF_PAGES_SHOW - NUMBER_OF_FRONT_PAGES;

function isPageNumberValid(newPage, totalPage) {
  return (newPage >= 1) && (newPage <= totalPage);
}

@translate(['pagination'])
export default class Pagination extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    className: PropTypes.string,
    currentPage: PropTypes.number,
    id: PropTypes.string,
    totalPage: PropTypes.number,
    onPageChange: PropTypes.func,
  }

  static defaultProps = {
    currentPage: 1,
  }

  handleOnPageChange = (pageNum) => {
    const { onPageChange, totalPage } = this.props;
    if (onPageChange && isPageNumberValid(pageNum, totalPage)) {
      onPageChange(pageNum);
    }
  }

  renderPageNumbers() {
    const { currentPage, totalPage } = this.props;
    const pages = [];
    let numFrontPages = NUMBER_OF_FRONT_PAGES;
    const remainPages = totalPage - currentPage;
    if (remainPages < NUMBER_OF_BACK_PAGES) {
      numFrontPages += NUMBER_OF_BACK_PAGES - remainPages - 1;
    }
    for (let i = 1; i <= numFrontPages; i++) {
      const prevPage = currentPage - i;
      if (prevPage > 0) {
        pages.unshift(prevPage);
      } else {
        break;
      }
    }
    const numBackPages = MAX_NUMBER_OF_PAGES_SHOW - pages.length;
    for (let i = 0; i < numBackPages; i++) {
      const nextPage = currentPage + i;
      if (nextPage > totalPage) {
        break;
      } else {
        pages.push(nextPage);
      }
    }
    return (
      pages.map(pageNum => {
        const className = (pageNum === currentPage) ? 'active' : null;
        return (
          <span
            {...{ className }}
            key={`page-${pageNum}`}
            onClick={() => this.handleOnPageChange(pageNum)}
          >
            {pageNum}
          </span>
        );
      })
    );
  }

  render() {
    const { t, currentPage, totalPage, id } = this.props;
    const className = classNames('pagination', this.props.className);
    return (
      <div {...{ id, className }}>
        <span
          className={(currentPage > 1) ? 'active' : ''}
          onClick={() => this.handleOnPageChange(currentPage - 1)}
        >
          {t('prevPage')}
        </span>
        {this.renderPageNumbers()}
        <span
          className={(currentPage < totalPage) ? 'active' : ''}
          onClick={() => this.handleOnPageChange(currentPage + 1)}
        >
          {t('nextPage')}
        </span>
      </div>
    );
  }
}
