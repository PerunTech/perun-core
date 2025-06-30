import React, { useEffect, useReducer, useRef } from 'react'

const Announcement = () => {
  const initialState = { announcements: [] }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ announcements }, setState] = useReducer(reducer, initialState)
  // This is needed for keeping track when the component is mounted and performing state changes, so React doesn't complain
  const componentIsMounted = useRef(true)

  useEffect(() => {
    getAnnouncements()
    return () => {
      componentIsMounted.current = false
    }
  }, [])

  const getAnnouncements = () => {
    const url = `${window.location.origin}${window.assets}/json/guide/external/AnnouncementJson.json`
    fetch(url)
      .then(res => res.json())
      .then(json => setState({ announcements: json }))
      .catch(err => { throw err });
  }

  return (
    <div className='annoucmentHolder'>
      {announcements.length > 0 && announcements.map((announcement, i) => {
        return (
          <li key={i}>
            <svg aria-hidden='true' focusable='false' data-prefix='fas' style={{ height: '15px', margin: '0 5px 4px 0' }} data-icon='hand-point-right' className='svg-inline--fa fa-hand-point-right fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M512 199.652c0 23.625-20.65 43.826-44.8 43.826h-99.851c16.34 17.048 18.346 49.766-6.299 70.944 14.288 22.829 2.147 53.017-16.45 62.315C353.574 425.878 322.654 448 272 448c-2.746 0-13.276-.203-16-.195-61.971.168-76.894-31.065-123.731-38.315C120.596 407.683 112 397.599 112 385.786V214.261l.002-.001c.011-18.366 10.607-35.889 28.464-43.845 28.886-12.994 95.413-49.038 107.534-77.323 7.797-18.194 21.384-29.084 40-29.092 34.222-.014 57.752 35.098 44.119 66.908-3.583 8.359-8.312 16.67-14.153 24.918H467.2c23.45 0 44.8 20.543 44.8 43.826zM96 200v192c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V200c0-13.255 10.745-24 24-24h48c13.255 0 24 10.745 24 24zM68 368c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'></path></svg>
            <a href={announcement.path} target='_blank' rel='noopener noreferrer' id={announcement.id} key={announcement.id}>{`${announcement.title}`}</a>
          </li>
        )
      })}
    </div>
  )
}

export default Announcement
