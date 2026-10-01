'use client';
export function PrintButton(){return <button className="button secondary no-print" onClick={()=>window.print()}>列印／另存 PDF</button>}