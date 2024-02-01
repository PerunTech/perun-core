import React from 'react';
import { addGrid, cleanGrids, removeGrid, store } from '../../model';
import { ComponentManager } from '..';
import GenericGrid from './GenericGrid.js';
import ExportableGrid from './ExportableGrid.js';

export default class GridManager extends React.Component {
  static generateGrid(
    key, id, configTableName, dataTableName, params, gridTypeParam, onRowClick, addRowFunc,
    enableMultiSelect, onSelectChange
  ) {
    return (<GenericGrid
      key={key}
      id={id}
      gridType={gridTypeParam}
      onRowClickFunct={onRowClick}
      configTableName={configTableName}
      dataTableName={dataTableName}
      params={params}
      enableMultiSelect={enableMultiSelect}
      onSelectChangeFunct={onSelectChange}
      addRowSub={addRowFunc}
    />)
  }

  static generateGridWithCustomSize(
    key, id, configTableName, dataTableName, params, gridTypeParam, onRowClick, addRowFunc,
    enableMultiSelect, onSelectChange, height, width, toggleCustomButton, customButton, customButtonLabel, hasLinkGridInModal, additionalButton, additionalButtonLabel) {
    return (<GenericGrid
      key={key}
      id={id}
      gridType={gridTypeParam}
      onRowClickFunct={onRowClick}
      configTableName={configTableName}
      dataTableName={dataTableName}
      params={params}
      enableMultiSelect={enableMultiSelect}
      onSelectChangeFunct={onSelectChange}
      addRowSub={addRowFunc}
      minHeight={height}
      minWidth={width}
      customButton={customButton}
      customButtonLabel={customButtonLabel}
      toggleCustomButton={toggleCustomButton}
      hasLinkGridInModal={hasLinkGridInModal}
      additionalButton={additionalButton}
      additionalButtonLabel={additionalButtonLabel}
    />)
  }

  static generateExportableGrid(
    key, id, configTableName, dataTableName, params, gridTypeParam, onRowClick, addRowFunc,
    enableMultiSelect, onSelectChange, height, width
  ) {
    return (<ExportableGrid
      key={key}
      id={id}
      gridType={gridTypeParam}
      onRowClickFunct={onRowClick}
      configTableName={configTableName}
      dataTableName={dataTableName}
      params={params}
      enableMultiSelect={enableMultiSelect}
      onSelectChangeFunct={onSelectChange}
      addRowSub={addRowFunc}
      minHeight={height}
      minWidth={width}
    />)
  }

  static generateExportableGridWithCustomBtn(
    key, id, configTableName, dataTableName, params, gridTypeParam, onRowClick, addRowFunc,
    enableMultiSelect, onSelectChange, height, width, toggleCustomButton, customButton, hasLinkGridInModal
  ) {
    return (<ExportableGrid
      key={key}
      id={id}
      gridType={gridTypeParam}
      onRowClickFunct={onRowClick}
      configTableName={configTableName}
      dataTableName={dataTableName}
      params={params}
      enableMultiSelect={enableMultiSelect}
      onSelectChangeFunct={onSelectChange}
      addRowSub={addRowFunc}
      minHeight={height}
      minWidth={width}
      customButton={customButton}
      toggleCustomButton={toggleCustomButton}
      hasLinkGridInModal={hasLinkGridInModal}
    />)
  }

  static reloadGridData(gridId) {
    ComponentManager.setStateForComponent(gridId, 'reloadGrid', true)
  }

  static addGridForRender(grid, groupId) {
    store.dispatch(addGrid(grid.key, grid, groupId))
  }

  static getGridToRender(groupId) {
    let toRender
    if (groupId !== undefined) {
      toRender = []
      const grids = groupId
      for (let i = 0; i < grids.length; i++) {
        const currGridConfig = grids[i]
        if (currGridConfig.id !== undefined) {
          var currGridObject = currGridConfig.grid
        }
        toRender.push(currGridObject)
      }
    }
    return toRender
  }

  static cleanGrids(groupId) {
    store.dispatch(cleanGrids(groupId))
  }

  /* does not exist */
  // static replaceState (grids, groupId) {
  //   store.dispatch(replaceGrids(grids, groupId))
  // }

  static removeGrid(gridId, groupId) {
    store.dispatch(removeGrid(gridId, groupId))
  }
}
