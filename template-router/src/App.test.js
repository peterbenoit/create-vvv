import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import App from './App.vue'

describe('App', () => {
	it('renders without errors', () => {
		const wrapper = mount(App, {
			global: {
				stubs: { RouterLink: true, RouterView: true },
			},
		})
		expect(wrapper.exists()).toBe(true)
	})

	it('renders nav links', () => {
		const wrapper = mount(App, {
			global: {
				stubs: { RouterLink: true, RouterView: true },
			},
		})
		expect(wrapper.find('nav').exists()).toBe(true)
	})
})
