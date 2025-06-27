import * as React from "react"
import { cn } from "@/lib/utils"

// ARIA live region component
export function AriaLive({
  children,
  ariaLive = "polite",
  className
}: {
  children: React.ReactNode
  ariaLive?: "polite" | "assertive" | "off"
  className?: string
}) {
  return (
    <div
      className={cn("sr-only", className)}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

// ARIA describedby component
export function AriaDescribedBy({
  children,
  describedBy,
  className
}: {
  children: React.ReactNode
  describedBy: string
  className?: string
}) {
  return (
    <div className={className} aria-describedby={describedBy}>
      {children}
    </div>
  )
}

// ARIA labelledby component
export function AriaLabelledBy({
  children,
  labelledBy,
  className
}: {
  children: React.ReactNode
  labelledBy: string
  className?: string
}) {
  return (
    <div className={className} aria-labelledby={labelledBy}>
      {children}
    </div>
  )
}

// ARIA controls component
export function AriaControls({
  children,
  controls,
  className
}: {
  children: React.ReactNode
  controls: string
  className?: string
}) {
  return (
    <div className={className} aria-controls={controls}>
      {children}
    </div>
  )
}

// ARIA expanded component
export function AriaExpanded({
  children,
  expanded,
  className
}: {
  children: React.ReactNode
  expanded: boolean
  className?: string
}) {
  return (
    <div className={className} aria-expanded={expanded}>
      {children}
    </div>
  )
}

// ARIA pressed component
export function AriaPressed({
  children,
  pressed,
  className
}: {
  children: React.ReactNode
  pressed: boolean
  className?: string
}) {
  return (
    <div className={className} aria-pressed={pressed}>
      {children}
    </div>
  )
}

// ARIA selected component
export function AriaSelected({
  children,
  selected,
  className
}: {
  children: React.ReactNode
  selected: boolean
  className?: string
}) {
  return (
    <div className={className} aria-selected={selected}>
      {children}
    </div>
  )
}

// ARIA current component
export function AriaCurrent({
  children,
  current,
  className
}: {
  children: React.ReactNode
  current?: boolean | "page" | "step" | "location" | "date" | "time"
  className?: string
}) {
  return (
    <div className={className} aria-current={current}>
      {children}
    </div>
  )
}

// ARIA invalid component
export function AriaInvalid({
  children,
  invalid,
  className
}: {
  children: React.ReactNode
  invalid: boolean
  className?: string
}) {
  return (
    <div className={className} aria-invalid={invalid}>
      {children}
    </div>
  )
}

// ARIA required component
export function AriaRequired({
  children,
  required,
  className
}: {
  children: React.ReactNode
  required: boolean
  className?: string
}) {
  return (
    <div className={className} aria-required={required}>
      {children}
    </div>
  )
}

// ARIA disabled component
export function AriaDisabled({
  children,
  disabled,
  className
}: {
  children: React.ReactNode
  disabled: boolean
  className?: string
}) {
  return (
    <div className={className} aria-disabled={disabled}>
      {children}
    </div>
  )
}

// ARIA hidden component
export function AriaHidden({
  children,
  hidden,
  className
}: {
  children: React.ReactNode
  hidden: boolean
  className?: string
}) {
  return (
    <div className={className} aria-hidden={hidden}>
      {children}
    </div>
  )
}

// ARIA busy component
export function AriaBusy({
  children,
  busy,
  className
}: {
  children: React.ReactNode
  busy: boolean
  className?: string
}) {
  return (
    <div className={className} aria-busy={busy}>
      {children}
    </div>
  )
}

// ARIA label component
export function AriaLabel({
  children,
  label,
  className
}: {
  children: React.ReactNode
  label: string
  className?: string
}) {
  return (
    <div className={className} aria-label={label}>
      {children}
    </div>
  )
}

// ARIA description component
export function AriaDescription({
  children,
  description,
  className
}: {
  children: React.ReactNode
  description: string
  className?: string
}) {
  return (
    <div className={className} aria-description={description}>
      {children}
    </div>
  )
}

// ARIA role component
export function AriaRole({
  children,
  role,
  className
}: {
  children: React.ReactNode
  role: string
  className?: string
}) {
  return (
    <div className={className} role={role}>
      {children}
    </div>
  )
}

// ARIA tabindex component
export function AriaTabIndex({
  children,
  tabIndex,
  className
}: {
  children: React.ReactNode
  tabIndex: number
  className?: string
}) {
  return (
    <div className={className} tabIndex={tabIndex}>
      {children}
    </div>
  )
}

// ARIA orientation component
export function AriaOrientation({
  children,
  orientation,
  className
}: {
  children: React.ReactNode
  orientation: "horizontal" | "vertical"
  className?: string
}) {
  return (
    <div className={className} aria-orientation={orientation}>
      {children}
    </div>
  )
}

// ARIA sort component
export function AriaSort({
  children,
  sort,
  className
}: {
  children: React.ReactNode
  sort?: "none" | "ascending" | "descending" | "other"
  className?: string
}) {
  return (
    <div className={className} aria-sort={sort}>
      {children}
    </div>
  )
}

// ARIA valuemin component
export function AriaValueMin({
  children,
  valueMin,
  className
}: {
  children: React.ReactNode
  valueMin: number
  className?: string
}) {
  return (
    <div className={className} aria-valuemin={valueMin}>
      {children}
    </div>
  )
}

// ARIA valuemax component
export function AriaValueMax({
  children,
  valueMax,
  className
}: {
  children: React.ReactNode
  valueMax: number
  className?: string
}) {
  return (
    <div className={className} aria-valuemax={valueMax}>
      {children}
    </div>
  )
}

// ARIA valuenow component
export function AriaValueNow({
  children,
  valueNow,
  className
}: {
  children: React.ReactNode
  valueNow: number
  className?: string
}) {
  return (
    <div className={className} aria-valuenow={valueNow}>
      {children}
    </div>
  )
}

// ARIA valuetext component
export function AriaValueText({
  children,
  valueText,
  className
}: {
  children: React.ReactNode
  valueText: string
  className?: string
}) {
  return (
    <div className={className} aria-valuetext={valueText}>
      {children}
    </div>
  )
} 