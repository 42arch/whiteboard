'use client'

import { Link } from '@/navigation'

export default function Switch() {
  const handleNavigation = () => {}

  return (
    <div className='flex gap-6 p-4 font-sans'>
      <Link href='/' locale='en'>
        en
      </Link>
      <Link href='/' locale='zh-Hans'>
        zh-Hans
      </Link>
    </div>
  )
}
