import { Scroll } from './Scroll'

const items = Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`)

export default {
    title: 'Primitives/Scroll',
    tags: ['autodocs'],
    component: Scroll,
    parameters: {
        layout: 'centered',
    },
    args: {
        className: 'w-[320px] rounded-md border border-zinc-200 bg-white p-4',
    },
}

export const Default = {
    render: (args) => (
        <div className="w-[360px]">
            <Scroll {...args}>
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item}
                            className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </Scroll>
        </div>
    ),
}

export const ShortContent = {
    render: (args) => (
        <div className="w-[360px]">
            <Scroll {...args}>
                <div className="space-y-2">
                    <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                        Primeiro item
                    </div>
                    <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                        Segundo item
                    </div>
                    <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                        Terceiro item
                    </div>
                </div>
            </Scroll>
        </div>
    ),
}

export const LongText = {
    render: (args) => (
        <div className="w-[360px]">
            <Scroll {...args}>
                <div className="space-y-4 text-sm leading-6 text-zinc-700">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                        posuere, risus at tincidunt posuere, tellus nibh pharetra justo,
                        vitae tristique lectus massa nec justo.
                    </p>
                    <p>
                        Sed euismod, velit nec facilisis luctus, purus lacus pretium mi, ut
                        dictum justo eros sit amet lorem. Nulla facilisi. Integer volutpat
                        justo nec orci tempus, ut efficitur massa pulvinar.
                    </p>
                    <p>
                        Curabitur fermentum, velit at faucibus sagittis, justo sapien
                        vehicula lorem, sed viverra neque velit eu purus. Suspendisse
                        potenti. Donec feugiat justo sed nibh tincidunt, non congue mi
                        tincidunt.
                    </p>
                    <p>
                        Aliquam erat volutpat. Morbi vitae tortor id augue eleifend
                        facilisis. In hac habitasse platea dictumst.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Non distinctio accusantium neque quia enim debitis quam sed totam sit accusamus tenetur, eaque, consectetur corporis, molestias commodi et temporibus ipsam beatae.
                        Nobis accusamus doloremque sunt. Eaque doloremque, veniam quod vero laboriosam earum recusandae qui ipsa ea veritatis impedit sed aliquam quas quis repudiandae, necessitatibus facilis quae ab id, sapiente cumque placeat?
                        Quisquam asperiores quasi, maxime eius voluptatibus molestiae minima beatae obcaecati, ad vero veritatis? Amet dolor, sed alias fugiat sint molestias distinctio nam accusamus perspiciatis quos quae, quasi earum illum. Placeat?
                        Quia laboriosam ullam laborum quas. Earum suscipit excepturi blanditiis laboriosam nemo nihil sint. Nam architecto ipsa omnis consequuntur id mollitia quos expedita aliquam sit nesciunt ratione, voluptate reprehenderit incidunt quaerat.
                        Corporis quae veniam possimus laudantium ea, placeat obcaecati labore nostrum officia nihil quibusdam fuga commodi voluptas ducimus laborum aspernatur autem perspiciatis natus sequi. Neque ipsum porro in dicta adipisci enim.
                        Minima voluptate voluptatem dolores molestiae quidem libero aliquid autem quisquam eos illum debitis maxime adipisci omnis, consequatur earum error, similique aut hic voluptas beatae cupiditate officiis nemo qui blanditiis. Quae.
                        Odit at ipsa facilis? Explicabo repellendus sapiente veniam tempora odit quis tenetur quibusdam numquam, officiis quidem perferendis quasi perspiciatis quas veritatis, ab quia. Obcaecati fugit dolorem temporibus architecto. Temporibus, corporis!
                        Culpa, esse nulla? Iusto amet nisi itaque iste exercitationem! Quia, veniam, ex doloribus magnam natus at eaque perferendis architecto quo consequatur unde quae eius corrupti, recusandae a corporis vero cum?
                        Cupiditate sit odio sequi veritatis expedita eaque? Quas, aut, odio sunt neque facilis tempora, vitae fugiat optio a consectetur assumenda nam eum dolorum impedit. Aliquid dolorem pariatur dolore aperiam explicabo.
                        Nulla facere vero architecto ullam cupiditate iusto sapiente ratione veniam libero minus ad vel mollitia fugiat ipsum expedita, sit sequi ut omnis? Ipsa nobis sint quaerat ratione itaque, dolorum ea.
                    </p>
                </div>
            </Scroll>
        </div>
    ),
}
