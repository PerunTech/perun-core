import React from 'react'
import Tour from 'react-user-tour'

const butonStyle = {
  'width': 'auto',
  'padding': '2px',
  'height': '30px',
  'backgroundColor': '#e0ab10',
  'color': 'rgb(73, 73, 73)',
  'fontWeight': '700',
  'display': 'inline-block',
  'textAlign': 'center',
  'cursor': 'pointer',
  'float': 'right',
  'paddingTop': '5px',
  'marginRight': '10px',
  'borderRadius': '5px'
}

const style = {
  'height': 'auto',
  'padding': '10px',
  'width': '350px',
  'position': 'absolute',
  'zIndex': '9999',
  'backgroundColor': 'rgb(255, 255, 255)',
  'color': 'rgb(73, 73, 73)',
  'boxShadow': 'rgba(0, 0, 0, 0.24) 0px 6px 8px 0px',
  'transform': 'translate3d(660px, 95px, 0px)',
  'borderRadius': '5px'
}

const buttonContainerStyle = {
  'bottom': '10px',
  'right': '0px'
}

export default class UserTour extends React.Component {
  constructor() {
    super()
    this.state = {
      isTourActive: false,
      tourStep: 1
    }
  }

  componentDidMount() {
    this.setState({ isTourActive: true })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.steps !== nextProps.steps) {
      this.setState({ isTourActive: true })
    }
  }

  render() {
    return (
      <div>
        <Tour
          active={this.state.isTourActive}
          step={this.state.tourStep}
          onNext={(step) => this.setState({ tourStep: step })}
          onBack={(step) => this.setState({ tourStep: step })}
          onCancel={() => this.setState({ isTourActive: false })}
          steps={this.props.steps}
          hideClose
          backButtonText='Назад'
          nextButtonText='Следно'
          doneButtonText='Затвори'
          style={style}
          buttonStyle={butonStyle}
          buttonContainerStyle={buttonContainerStyle}
        />
      </div>
    )
  }
}
