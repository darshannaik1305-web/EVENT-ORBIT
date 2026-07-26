import React from 'react'
import Checkbox from '@/components/common/Checkbox'

export default function RememberMe({ checked, onChange, id = 'remember-me' }) {
  return (
    <Checkbox
      id={id}
      label="Remember me"
      checked={checked}
      onChange={onChange}
    />
  )
}
