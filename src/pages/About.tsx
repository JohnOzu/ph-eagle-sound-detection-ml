export default function About() {
    return(
        <>
            <section className="mt-5 flex flex-col justify-center items-center space-y-3">
                <h2 className="text-white font-semibold text-3xl">
                    About AgilaGuard
                </h2>
                <div className="w-[80%] flex flex-col justify-center items-center space-y-3">
                    <p className="text-white text-justify text-md">
                        <strong>AgilaGuard</strong> is a cutting-edge conservation tool designed to protect one of nature’s 
                        most majestic predators. By leveraging advanced audio detection technology, AgilaGuard listens 
                        for the calls of the Philippine eagle, detects their presence, and helps researchers and 
                        conservationists monitor these endangered birds in real time.
                    </p>
                    <p className="text-white text-justify text-md">
                        <strong>Listen. Detect. Conserve.</strong> <br/>
                        From dense forests to remote habitats, AgilaGuard empowers conservation efforts, 
                        providing critical insights to safeguard the future of the Philippine eagle. 
                        Our mission is simple but vital: listen carefully, detect accurately, and conserve relentlessly.
                    </p>
                </div>
            </section>
        </>
    )
}