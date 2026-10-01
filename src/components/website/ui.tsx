'use client';
import { createContext, useContext } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ComponentProps } from 'react';

export function Button({ variant, size, className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) {
  return <button type={type} className={`button ${variant === 'outline' ? 'secondary' : variant === 'destructive' ? 'danger' : ''} ${size === 'sm' ? 'small' : ''} ${className}`} {...props}/>;
}
export function Input(props: ComponentProps<'input'>) { return <input {...props}/>; }
export function Textarea(props: ComponentProps<'textarea'>) { return <textarea {...props}/>; }
const TabContext = createContext<{value:string; onValueChange:(value:string)=>void}>({value:'',onValueChange:()=>{}});
export function Tabs({value,onValueChange,children}:{value:string;onValueChange:(value:string)=>void;children:React.ReactNode}) { return <TabContext value={{value,onValueChange}}>{children}</TabContext>; }
export function TabsList(props: HTMLAttributes<HTMLDivElement>) { return <div role="group" aria-label="內容分類" {...props}/>; }
export function TabsTrigger({value,children}:{value:string;children:React.ReactNode}) { const tabs=useContext(TabContext); return <button type="button" className={`chip ${tabs.value===value?'selected':''}`} aria-pressed={tabs.value===value} onClick={()=>tabs.onValueChange(value)}>{children}</button>; }
