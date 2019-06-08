// test.js

// Import the `mount()` method from the test utils
// and the component you want to test
import BootstrapVue from 'bootstrap-vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'

// create an extended `Vue` constructor
const Vue = createLocalVue()
Vue.config.ignoredElements = ['b-modal','b-checkbox']
Vue.use(BootstrapVue)


import AddProblemSetModal from '@/components/views/ProblemSetsManagerComponents/AddProblemSetModal.vue'


describe('AddProblemSetModal', () => {
  // Now mount the component and you have the wrapper
  const wrapper = shallowMount(AddProblemSetModal,{Vue})

   expect(wrapper.isVueInstance()).toBeTruthy()

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })
  //
  // // it's also easy to check for the existence of elements
  // it('has a button', () => {
  //   expect(wrapper.contains('button')).toBe(true)
  // })
})
