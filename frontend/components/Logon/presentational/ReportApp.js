import React from 'react'
import axios from 'axios'
import { alertUser } from '../../../elements'
import Modal from '../../Modal/Modal'
import Loading from '../../Loading/Loading'
import { iconManager } from '../../../assets/svg/svgHolder'

export default class ReportApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      idNo: '',
      appNo: '',
      pin: 'ID_NO',
      isLoading: false
    }
  }

  componentDidMount() {
    let url = 'https://api.ipify.org?format=json'
    let th1s = this
    axios.get(url).then((response) => {
      if (response.data) {
        th1s.setState({ userIp: response.data.ip })
      }
    }).catch((err) => {
      if (err) {
        if (err.data) {
          if (err.data.type) {
            alertUser(true, err.response.data.type.toLowerCase(), err.response.data.message, null, this.closeAlert)
          }
        }
      }
    })
  }

  onchange = (e) => {
    this.setState({ [e.target.id]: e.target.value })

    if (e.target.id === 'pin') {
      document.getElementById('appNo').value = ""
      document.getElementById('idNo').value = ""
    }
  }

  showApps = () => {
    let idNo
    let appNo
    let pin = this.state.pin
    if (this.state.idNo) {
      idNo = this.state.idNo
    } else {
      return alertUser(true, 'info', 'Ве молиме пополнете го полето за матичен/даночен број', null)
    }
    if (this.state.appNo) {
      appNo = this.state.appNo
    } else {
      return alertUser(true, 'info', 'Ве молиме пополнете го полето за број на барање', null)
    }
    this.setState({ isLoading: <Loading /> })
    this.getApplication(idNo, appNo, pin)
  }

  getApplication = (idNo, appNo, pin) => {
    let content = []
    let measureRows = []
    let subRowsPaid = []
    let subRowsDebt = []
    let paragraph
    let grid1
    let grid2
    let mainApp
    let sumPaid
    let debtReturned

    let url = window.server + '/PublicWs/getApplications/' + this.state.userIp + '/' + idNo + '/' + appNo + '/' + pin
    axios.get(url)
      .then((response) => {
        if (response.data) {
          this.setState({ isLoading: false })
          mainApp = response.data
          if (mainApp.debt) {
            mainApp.debt.forEach((debt) => {
              paragraph = <p className='paragraphReport'>Должите {debt.amount} денари, на {debt.institution} за {debt.year} година</p>
              content.push(paragraph)
            })
          }
          grid1 = <div className='container'>
            <div className='titleContainer'>
              <h2 className='tableTitle'>Во прилог Вашето барање</h2>
            </div>
            <table className='table'>
              <thead>
                <tr>
                  <th>Статус на барање</th>
                  <th>Број на барање</th>
                  <th>Тип на апликација</th>
                  <th>Година</th>
                </tr>
              </thead>
              <tbody>
                <tr className='rowCustomStyle'>
                  <td>{mainApp.appStatus}</td>
                  <td>{mainApp.appNumber}</td>
                  <td>{mainApp.аppType}</td>
                  <td>{mainApp.year}</td>
                </tr>
              </tbody>
            </table>
          </div>
          content.push(grid1)

          if (mainApp.measures) {
            grid2 = <div className='container'>
              <div className='titleContainer'>
                <p>Преглед на статус по мерка, за повеќе детали Ве молиме одберете ја соодветната мерка</p>
              </div>
              <table className='table'>
                <thead>
                  <tr>
                    <th>Мерка</th>
                    <th>Опис на мерка</th>
                    <th>Статус на мерка</th>
                    <th>Исплатена сума</th>
                    <th>Вратен долг</th>
                  </tr>
                </thead>
                {mainApp.measures.forEach((measure) => {
                  subRowsPaid = []
                  subRowsDebt = []
                  sumPaid = 0
                  debtReturned = 0
                  if (measure.payment && measure.payment.length > 0) {
                    subRowsPaid.push(<tr>
                      <th>Сума</th>
                      <th>Опис на мерка</th>
                      <th>Број на решение</th></tr>)
                    measure.payment.forEach((amount) => {
                      sumPaid += amount.amount
                      subRowsPaid.push(<tr><td>{amount.amount}</td><td>{amount.measure}</td><td>{amount.num_solution}</td></tr>)
                    })
                  }

                  if (measure.clearing_debt && measure.clearing_debt.length > 0) {
                    subRowsDebt.push(<tr>
                      <th>Сума</th>
                      <th>Институција</th>
                      <th>Мерка</th>
                      <th>Програма</th></tr>)
                    measure.clearing_debt.forEach((debtAmount) => {
                      debtReturned += debtAmount.amount
                      subRowsDebt.push(<tr><td>{debtAmount.amount}</td><td>{debtAmount.institution}</td><td>{debtAmount.measure}</td><td>{debtAmount.program}</td></tr>)
                    })
                  }
                  let measureRow =
                    <tbody>
                      <tr id={measure.label_text} onClick={(e) => this.rowInfo(e, measure.label_text, measure.label_desc)} className='rowCustomMeasureStyle'>
                        <td>{measure.label_text}</td>
                        <td>{measure.label_desc}</td>
                        <td>{measure.status}</td>
                        <td>{sumPaid}</td>
                        <td>{debtReturned}</td>
                      </tr>
                      {this.setState({
                        [measure.label_text + 'amount']: <div id={measure.label_text + 'amount'} className='holderAmount'>
                          <div id='paid' className='amountInfo'><a>Детален приказ на исплатена сума</a>{subRowsPaid}</div>
                          <div id='debt' className='amountInfo'><a>Детален приказ на вратен долг</a>{subRowsDebt}</div>
                        </div>
                      })}
                    </tbody>
                  measureRows.push(measureRow)
                })}
                {measureRows}
              </table>
            </div>
            content.push(grid2)
          }
        }
        this.setState({ content: content })
      })
      .catch((error) => {
        this.setState({ isLoading: false })
        return console.log(error)
      })
  }

  rowInfo = (e, labelText, labelDesc) => {
    let currentHtml = e.currentTarget.id + 'amount'
    let htmlT = this.state[currentHtml]
    let amountModal = <Modal customClassBtnModal='customClassBtnModal'
      closeModal={this.closeModal}
      closeAction={this.closeModal}
      modalContent={htmlT}
      modalTitle={labelText + '-' + labelDesc}
      nameCloseBtn='Затвори'
    />

    this.setState({ amountModal: amountModal, showamountModal: true })
  }

  closeModal = () => {
    this.setState({ showamountModal: false })
  }

  render() {
    const { content, showamountModal, amountModal, isLoading } = this.state
    return (
      <div id='main' className='reportCompHolder'>
        {showamountModal && amountModal}
        {isLoading}
        <div id='reportContainer' className='reportContainer'>
          <div id='reportAppForm' className='reportstyle'>
            <div id='block1' className='block'>
              <select id="pin" onChange={this.onchange} className='report-custom-select'>
                <option value="ID_NO">Матичен број</option>
                <option value="TAX_NO">Даночен број</option>
              </select>
              <input id='idNo' className='input-appNo' type='text' onChange={this.onchange} />
            </div>
            <div id='block2' className='block'>
              <div className='form-label'>Број на барање</div>
              <input id='appNo' className='input-appNo' type='text' onChange={this.onchange} />
            </div>
            <button onClick={this.showApps} className='searchApp'>{iconManager.getIcon('searchIcon')}Пребарај</button>
          </div>
          <div id='tables' className='custom-table'>
            {content}
          </div>
        </div>
      </div>
    )
  }
}
