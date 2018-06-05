import React from 'react';
import PropTypes from 'prop-types';

import _chunk from 'lodash/chunk';

import LibraryGridItem from './LibraryGridItem';

import './LibraryGridList.style.scss';


function LibraryGridList(props) {
  const {
    columns,
    libraries,
    togglingLibraryId,
    type,
    onClick,
    onToggleLibrary,
  } = props;
  const libraryChunks = _chunk(libraries, columns);

  function renderItem(library) {
    return (
      <LibraryGridItem
        key={library.id}
        library={library}
        togglingLibraryId={togglingLibraryId}
        type={type}
        onClick={onClick}
        onToggle={onToggleLibrary}
      />
    );
  }

  function renderItemRow(libraryChunk, index) {
    const children = libraryChunk.map(library => renderItem(library, type, togglingLibraryId, onToggleLibrary));
    while (children.length < columns) {
      children.push(
        <li
          key={`dummy-${children.length}`}
          className="library-grid-item dummy"
        />
      );
    }
    return (
      <li key={index} className="library-grid-list-row" >
        <ul className="library-grid-list-row-container">
          {children}
        </ul>
      </li>
    );
  }

  return (
    <ul className="library-grid-list">
      {libraryChunks.map(renderItemRow)}
    </ul>
  );
}

LibraryGridList.propTypes = {
  type: PropTypes.string.isRequired,
  columns: PropTypes.number,
  libraries: PropTypes.array,
  togglingLibraryId: PropTypes.number,
  onClick: PropTypes.func,
  onToggleLibrary: PropTypes.func,
};

LibraryGridList.defaultProps = {
  columns: 4,
  libraries: [],
};

export default LibraryGridList;
