import React from 'react'

export default class Footer extends React.Component {
    render() {
        return (
            <div className='main-footer'>
                <div className=''>
                    {/* <a href='http://www.perun.tech' target='_blank' className={mainStyle['link-default']}>
            Agri consulting
          </a>
          <a href='http://www.perun.tech' target='_blank' className={mainStyle['link-default']}>
            Octigon
          </a> */}
                    <a href='http://www.perun.tech' target='_blank' rel="noopener noreferrer" className='link-default'>
                        Perun Technologies ©
                    </a>
                </div>
            </div>
        )
    }
}
