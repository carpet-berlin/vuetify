// Utilities
import { inject, reactive, watch } from 'vue'
import { mergeDeep } from '@/util'

// Types
import type { DateAdapter } from './DateAdapter'
import type { LocaleInstance } from '@/composables/locale'

// Adapters
import { VuetifyDateAdapter } from './adapters/vuetify'

// Types
import type { InjectionKey } from 'vue'

export interface DateInstance<T = DateInstanceType['instanceType']> extends DateAdapter<T> {
  locale?: any
}

/** Supports module augmentation to specify date object types */
export interface DateInstanceType {
  instanceType: unknown
}

export type InternalDateOptions<T = unknown> = {
  adapter: (new (options: { locale: any, formats?: any }) => DateInstance<T>) | DateInstance<T>
  formats?: Record<string, any>
  locale: Record<string, any>
}

export type DateOptions<T = any> = Partial<InternalDateOptions<T>>

export const DateAdapterSymbol: InjectionKey<DateInstance> = Symbol.for('vuetify:date-adapter')

export function createDate (options: DateOptions | undefined, locale: LocaleInstance) {
  const date = mergeDeep({
    adapter: VuetifyDateAdapter,
    locale: {
      af: 'af-ZA',
      // ar: '', # not the same value for all variants
      bg: 'bg-BG',
      ca: 'ca-ES',
      ckb: '',
      cs: 'cs-CZ',
      de: 'de-DE',
      el: 'el-GR',
      en: 'en-US',
      // es: '', # not the same value for all variants
      et: 'et-EE',
      fa: 'fa-IR',
      fi: 'fi-FI',
      // fr: '', #not the same value for all variants
      hr: 'hr-HR',
      hu: 'hu-HU',
      he: 'he-IL',
      id: 'id-ID',
      it: 'it-IT',
      ja: 'ja-JP',
      ko: 'ko-KR',
      lv: 'lv-LV',
      lt: 'lt-LT',
      nl: 'nl-NL',
      no: 'no-NO',
      pl: 'pl-PL',
      pt: 'pt-PT',
      ro: 'ro-RO',
      ru: 'ru-RU',
      sk: 'sk-SK',
      sl: 'sl-SI',
      srCyrl: 'sr-SP',
      srLatn: 'sr-SP',
      sv: 'sv-SE',
      th: 'th-TH',
      tr: 'tr-TR',
      az: 'az-AZ',
      uk: 'uk-UA',
      vi: 'vi-VN',
      zhHans: 'zh-CN',
      zhHant: 'zh-TW',
    },
  }, options) as InternalDateOptions

  const instance = reactive(
    typeof date.adapter === 'function'
    // eslint-disable-next-line new-cap
      ? new date.adapter({
        locale: date.locale?.[locale.current.value] ?? locale.current.value,
        formats: date.formats,
      })
      : date.adapter
  )

  watch(locale.current, value => {
    const newLocale = date.locale ? date.locale[value] : value
    instance.locale = newLocale ?? instance.locale
  })

  return instance
}

export function useDate () {
  const instance = inject(DateAdapterSymbol)

  if (!instance) throw new Error('[Vuetify] Could not find injected date adapter')

  return instance
}

// https://stackoverflow.com/questions/274861/how-do-i-calculate-the-week-number-given-a-date/275024#275024
export function getWeek (adapter: DateAdapter<any>, value: any) {
  const date = adapter.toJsDate(value)
  let year = adapter.getYear(date)
  let d1w1 = adapter.startOfYear(date)

  if (date < d1w1) {
    year = year - 1
    d1w1 = adapter.startOfYear(adapter.setYear(date, year))
  } else {
    const tv = adapter.startOfYear(adapter.setYear(date, year + 1))
    if (date >= tv) {
      year = year + 1
      d1w1 = tv
    }
  }

  const diffTime = Math.abs(date.getTime() - d1w1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.floor(diffDays / 7) + 1
}
