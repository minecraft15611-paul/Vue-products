<template>
  <footer class="bg-black text-white pt-16 pb-8 px-6 font-sans">
    <div class="max-w-7xl mx-auto">

      <!-- Nav Sections -->
      <div class="mb-16">
        <!-- Mobile: Accordion | Desktop: 3-col grid -->
        <div class="md:grid md:grid-cols-3 md:gap-12">

          <!-- Section: Store Info -->
          <div class="border-b border-gray-800 md:border-none">
            <button
              class="w-full flex justify-between items-center text-left py-4 md:py-0 md:cursor-default"
              @click="toggle(0)"
            >
              <h3 class="text-base font-bold tracking-widest md:mb-6 md:pb-2 md:border-b md:border-gray-800 w-full">
                Store Info
              </h3>
              <span class="md:hidden text-gray-400 text-xs ml-4 transition-transform duration-300"
                :class="open === 0 ? 'rotate-180' : ''">▼</span>
            </button>
            <ul
              class="overflow-hidden transition-all duration-300 ease-in-out space-y-4 md:space-y-3"
              :class="open === 0 ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-none'"
            >
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Contact Us</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Our Story</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Store Locator</a></li>
            </ul>
          </div>

          <!-- Section: Help -->
          <div class="border-b border-gray-800 md:border-none">
            <button
              class="w-full flex justify-between items-center text-left py-4 md:py-0 md:cursor-default"
              @click="toggle(1)"
            >
              <h3 class="text-base font-bold tracking-widest md:mb-6 md:pb-2 md:border-b md:border-gray-800 w-full">
                HELP
              </h3>
              <span class="md:hidden text-gray-400 text-xs ml-4 transition-transform duration-300"
                :class="open === 1 ? 'rotate-180' : ''">▼</span>
            </button>
            <ul
              class="overflow-hidden transition-all duration-300 ease-in-out space-y-4 md:space-y-3"
              :class="open === 1 ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-none'"
            >
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Track Order</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Size Guide</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Payment Methods</a></li>
            </ul>
          </div>

          <!-- Section: Company -->
          <div class="border-b border-gray-800 md:border-none">
            <button
              class="w-full flex justify-between items-center text-left py-4 md:py-0 md:cursor-default"
              @click="toggle(2)"
            >
              <h3 class="text-base font-bold tracking-widest md:mb-6 md:pb-2 md:border-b md:border-gray-800 w-full">
                COMPANY
              </h3>
              <span class="md:hidden text-gray-400 text-xs ml-4 transition-transform duration-300"
                :class="open === 2 ? 'rotate-180' : ''">▼</span>
            </button>
            <ul
              class="overflow-hidden transition-all duration-300 ease-in-out space-y-4 md:space-y-3"
              :class="open === 2 ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-none'"
            >
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Sustainability</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Careers</a></li>
              <li><a href="#" class="text-gray-400 text-sm hover:text-white transition-colors block py-1 md:py-0">Privacy Policy</a></li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div class="flex items-center space-x-6 opacity-40 grayscale">
          <span class="text-xs font-semibold tracking-tighter">VISA</span>
          <span class="text-xs font-semibold tracking-tighter">MasterCard</span>
          <span class="text-xs font-semibold tracking-tighter">LinePay</span>
        </div>

        <p class="text-[10px] text-gray-500 uppercase tracking-widest">
          © 2026 LemonTree. All rights reserved.
        </p>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(null)

const toggle = (index) => {
  // On desktop (md+), don't use accordion behaviour
  if (window.innerWidth >= 768) return
  open.value = open.value === index ? null : index
}
</script>