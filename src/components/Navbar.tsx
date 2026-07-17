"use client"
import Link from 'next/link'
import React from 'react'

const links = [
    {name: "Home", href:"/"},
    {name: "Categories", href:"/categories/hello"},
    {name: "Posts", href:"/posts/1"},
    {name: "Search", href:"/search"},
    {name: "Tags", href: "/tags/tag1"},
    {name: "Admin", href: "/admin"}
]

const Navbar = () => {
  return (
    <div className='flex justify-evenly items-center h-8'>
        {links.map((link,idx) => {
            return <Link href={link.href} key={idx}>{link.name}</Link>
        })}
    </div>
  )
}

export default Navbar