import Breadcrumb from '@/components/common/Breadcrumb'
import React from 'react'

const collection = () => {
  return (
    <div  >
       <Breadcrumb
              items={[
                {
                  label: "Trang chủ",
                  href: "/",
                },
                {
                  label: "Bộ sưu tập",
                },
              ]}
            />
    </div>
  )
}

export default collection