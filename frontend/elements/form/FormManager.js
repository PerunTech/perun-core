import React from 'react';
import GenericForm from './GenericForm'

export default class FormManager extends React.Component {
  static generateForm(
    id, configFormName, params, reducer, method, uiSchemaConfigMethod, tableFormDataMethod,
    addCloseFunction, addSaveFunction, addCustomFunction, addCustomButtonName,
    className, classNameBtn, hideBtns, onAlertClose, confirmButtonColor,
    enableExcludedFields, formFieldsToBeEcluded, inputWrapper, FormExtension, customSave, bypassInputChange
  ) {
    /* The inputWrapper parameter accepts a React class which acts as
      functional wrapper for the form input fields, providing them with
      additional functionalities, defined by the class received as a parameter.
      Import the class and pass it down as a function parameter when
      instantiating a new react jsonschema form with this function.

      The FormExtension parameter accepts a React class which renders additional
      fields in the generic form. These fields are defined in the class sent
      as as parameter
    } */
    const customForm = (<GenericForm
      id={id}
      configFormName={configFormName}
      params={params}
      reducer={reducer}
      method={method}
      uiSchemaConfigMethod={uiSchemaConfigMethod}
      tableFormDataMethod={tableFormDataMethod}
      addCloseFunction={addCloseFunction}
      addSaveFunction={addSaveFunction}
      customSave={customSave}
      addCustomFunction={addCustomFunction}
      addCustomButtonName={addCustomButtonName}
      className={className}
      classNameBtn={classNameBtn}
      hideBtns={hideBtns}
      onAlertClose={onAlertClose}
      confirmButtonColor={confirmButtonColor}
      enableExcludedFields={enableExcludedFields}
      formFieldsToBeEcluded={formFieldsToBeEcluded}
      inputWrapper={inputWrapper}
      FormExtension={FormExtension}
      bypassInputChange={bypassInputChange}
    />)
    return customForm
  }
}
