import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types'
import { alertUser, Dropdown } from "../../../elements/";
import UsersGrid from "../UsersGrid";
import Form from "@rjsf/core";
import axios from "axios";
import { connect } from "react-redux";
import Loading from "../../Loading/Loading";
import { userDropDownListSchema } from "../utils/userDropDownListSchema";
import validator from '@rjsf/validator-ajv8';
const ShowUsersDropDown = (props, context) => {
  const [selectedOption, setSelectedOption] = useState(undefined);
  const [showUserDrop, setshowUserDrop] = useState(null);
  const [grid, setGrid] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [formDataHold, setformDataHold] = useState({});
  const { schema, uiSchema } = userDropDownListSchema(context)
  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = () => {
    setLoading(true);
    let dropOpt = [
      { text: context.intl.formatMessage({ id: 'perun.admin_console.choose_user_type', defaultMessage: 'perun.admin_console.choose_user_type' }), value: 0, hidden: true },
    ];
    const { svSession } = props;
    const verbPath = `/ReactElements/getTableWithLike/`;
    const url = `${window.server}${verbPath}${svSession}/SVAROG_CODES/PARENT_CODE_VALUE/USER_TYPE/100`;
    axios
      .get(url)
      .then((res) => {
        res.data.map((dat) => {
          dropOpt.push({
            text: dat["SVAROG_CODES.LABEL_CODE"],
            value: dat["SVAROG_CODES.CODE_VALUE"],
          });
        });
        generateDropDown(dropOpt);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const generateDropDown = (dropOpt) => {
    const showUsersDD = (
      <div className='admin-console-show-user-form-group'>
        <label htmlFor="showUsersDD" className="ml-2 text-dark">
          {context.intl.formatMessage({ id: 'perun.admin_console.user_type', defaultMessage: 'perun.admin_console.user_type' })}
        </label>
        <Dropdown
          key="showUsersDD"
          id="showUsersDD"
          name="selectedOption"
          onChange={onChange}
          options={dropOpt}
        />
      </div>
    );
    return setshowUserDrop(showUsersDD);
  };
  const onChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const showTable = (e) => {
    setGrid(undefined);

    alertUser(
      true,
      "info",
      context.intl.formatMessage({ id: 'perun.admin_console.change_status_alert_title', defaultMessage: 'perun.admin_console.change_status_alert_title' }),
      null
    );
    e.formData.type = selectedOption;
    setformDataHold(e.formData);
    if (!e.formData["pin"] && !e.formData["username"]) {
      alertUser(
        true,
        "info",
        context.intl.formatMessage({ id: 'perun.admin_console.notification', defaultMessage: 'perun.admin_console.notification' }),
        context.intl.formatMessage({ id: 'perun.admin_console.fill_minimum_title', defaultMessage: 'perun.admin_console.fill_minimum_title' })
      );
    } else {
      if (e.formData["username"] && e.formData["username"].length < 3 || e.formData["pin"] && e.formData["pin"].length < 3) {
        alertUser(true, "info", context.intl.formatMessage({ id: 'perun.admin_console.minimum_char_title', defaultMessage: 'perun.admin_console.minimum_char_title' }));
      } else {
        getTableDataFromFilter(e.formData);
      }
    }
  };

  const getTableDataFromFilter = (testData) => {
    setLoading(true);
    const basicData = {
      OBJECT_TYPE: 57,
      ROW_NUM: 1000,
      ORT_ORDER: "DESC",
      SORT_BY_FIELD: "PKID",
    };
    const { svSession } = props;
    const url = `${window.server}/ReactElements/getTableWithMultipleFilters/${svSession}`;
    const data = new URLSearchParams();
    let multipleFilterData = [];
    if (testData["type"]) {
      multipleFilterData.push({
        fieldName: "USER_TYPE",
        fieldValue: testData["type"],
        dbOperand: "EQUAL",
        nextLogicOperand: "AND",
      });
    }
    if (testData["pin"]) {
      multipleFilterData.push({
        fieldName: "PIN",
        fieldValue: testData["pin"],
        dbOperand: "LIKE",
        nextLogicOperand: "AND",
      });
    }
    if (testData["username"]) {
      multipleFilterData.push({
        fieldName: "USER_NAME",
        fieldValue: testData["username"].toUpperCase(),
        dbOperand: "LIKE",
        nextLogicOperand: "AND",
      });
    }
    data.append("multipleFilterData", JSON.stringify(multipleFilterData));
    data.append("basicData", JSON.stringify(basicData));
    const reqConfig = {
      method: "post",
      data,
      url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    axios(reqConfig)
      .then((res) => {
        if (res.data !== "empty") {
          let grid = (
            <UsersGrid
              gridData={res.data}
              rowClickFn={props.rowClickFn}
              editUser={props.editUser}
              showUsersFn={props.showUsersFn}
              changeUserStatus={props.changeUserStatus}
              changeUserPassword={props.changeUserPassword}
            />
          );
          setLoading(false);
          return setGrid(grid);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const generateForm = () => {
    const form = (
      <Form
        validator={validator}
        className='admin-console-show-user-main-form'
        uiSchema={uiSchema}
        onSubmit={showTable}
        schema={schema}
        formData={formDataHold}
      >
        <div className='admin-console-show-user-btn-cont'>
          <button className='admin-console-show-user-form-btn' type='submit'>
            {context.intl.formatMessage({ id: 'perun.admin_console.search_button', defaultMessage: 'perun.admin_console.search_button' })}
          </button>
        </div>
      </Form>
    );
    return form;
  };

  return (
    <React.Fragment>
      <div className='admin-console-show-user-container'>
        <div className='admin-console-show-user-customform'>
          <legend className='admin-console-show-user-legend'>
            {context.intl.formatMessage({ id: 'perun.admin_console.search_user_legend', defaultMessage: 'perun.admin_console.search_user_legend' })}
          </legend>
          <div className='admin-console-show-user-inputholder'>
            {showUserDrop && showUserDrop}
            {generateForm()}
          </div>
        </div>
        <div className='admin-console-show-user-gridcont'>{grid && grid}</div>
      </div>
      {loading && <Loading />}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

ShowUsersDropDown.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ShowUsersDropDown);
