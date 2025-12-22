import React, { useState, useEffect } from 'react';

const Icon = ({ name, ...props }) => {
  const [IconComponent, setIconComponent] = useState(null)

  useEffect(() => {
    if (!name) return
    import('@tabler/icons-react').then((icons) => {
      setIconComponent(() => icons[name])
    }).catch(() => setIconComponent(null))
  }, [name])

  if (!IconComponent) return null
  return <IconComponent {...props} />
}

export default Icon
