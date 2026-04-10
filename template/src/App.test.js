import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import App from './App.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

describe('App', () => {
	it('renders without errors', () => {
		const wrapper = mount(App)
		expect(wrapper.find('h1').exists()).toBe(true)
	})

	it('shows Call /api/hello button', () => {
		const wrapper = mount(App)
		expect(wrapper.find('button').text()).toContain('Call /api/hello')
	})
})
