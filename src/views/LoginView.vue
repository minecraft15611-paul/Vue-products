<template>
                        <!--=============== Mobile Version ===============-->

    <div class="flex flex-col h-screen lg:hidden">
        <div class="w-full h-[15%] bg-white"></div>

        <div class="flex flex-col items-center h-[65%] px-5">

            <div class="text-[28px] tracking-[0.2em] mb-10">
                LemonTree
            </div>

            <div class="text-xl font-light self-start mb-1">
                Sign in
            </div>

            <div class="text-[13px] text-gray-400 self-start mb-6">
                Sign in or create an account
            </div>

            <button class="w-full bg-[#5c47f5] text-white py-3 mb-3 font-bold transition ">
                Continue wiht shop
            </button>

            <div class="flex w-full items-center mb-3">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-4 text-[14px] text-gray-500">or</span>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>

            <input type="text" placeholder="Email" class="w-full mb-3 border-gray-300">

            <button class="w-full bg-black text-white py-3 font-light mt-2">
                Continue
            </button>

            <div class="text-[11px] text-gray-500 text-center leading-relaxed mt-4">
                By continuing, you agree to our
                <span 
                    class="cursor-pointer underline underline-offset-2 transition-colors"
                >
                    Terms of service
                </span>
            </div>

        </div>
        <div class="w-full h-[15%]">

        </div>
        <footer class="flex justify-center ">
            <p>Privacy policy</p>
        </footer>

    </div>

                        <!--=============== Desktop Version ===============-->

    <div class="hidden lg:flex flex-col items-center pt-30 min-h-screen bg-white relative">

        <!-- Logo -->
        <div class="px-10 mb-10 tracking-[0.3em] text-[26px]">
            LemonTree
        </div>

        <!-- Form Area -->
        <div class="w-full max-w-[380px] flex flex-col">

            <div class="text-[22px] font-light mb-1">
                Sign in
            </div>

            <div class="text-[13px] text-gray-400 mb-6">
                Sign in or create an account
            </div>

            <button class="w-full bg-[#5c47f5] text-white py-3 mb-4 font-medium tracking-wide transition hover:bg-[#4a38e0]">
                Continue with shop
            </button>

            <div class="flex w-full items-center mb-4">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-4 text-[13px] text-gray-400">or</span>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>

            <input
                type="email"
                placeholder="Email"
                class="w-full border border-gray-300 px-4 py-3 mb-3 text-[14px] outline-none focus:border-gray-500 transition"
            />

            <button class="w-full bg-black text-white py-3 font-light tracking-wide transition mb-4">
                Continue
            </button>

            <div class="text-[11px] text-gray-400 text-center leading-relaxed">
                By continuing, you agree to our
                <span class="cursor-pointer underline underline-offset-2 hover:text-gray-600 transition-colors">
                    Terms of service
                </span>
            </div>

        </div>

        <!-- Footer -->
        <footer class="absolute bottom-6 text-[12px] text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
            Privacy policy
        </footer>

    </div>
</template>