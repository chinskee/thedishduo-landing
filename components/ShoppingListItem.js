import React from 'react'

export default function ShoppingListItem({ name, amount, unit }) {
  return (
    <li className="bg-white rounded-xl shadow-card p-4 mb-2 flex justify-between items-center">
      <span className="text-base font-semibold text-neutralDark">{name}</span>
      <span className="text-sm text-neutralDark">{amount} {unit}</span>
    </li>
  )
}