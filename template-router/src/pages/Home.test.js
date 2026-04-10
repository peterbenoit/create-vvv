import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Home from './Home.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

describe('Home', () => {
	it('renders without errors', () => {
		const wrapper = mount(Home)
		expect(wrapper.find('h1').exists()).toBe(true)
	})

	it('shows Call /api/hello button', () => {
		const wrapper = mount(Home)
		expect(wrapper.find('button').text()).toContain('Call /api/hello')
	})
})
