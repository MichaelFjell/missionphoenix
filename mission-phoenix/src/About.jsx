import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <style>{`
        .about-title{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
        .about-sep{width:60px;height:2px;background:var(--copper);margin-bottom:40px;border-radius:2px;}
        .about-portrait{display:flex;justify-content:center;margin-bottom:32px;}
        .about-portrait img{max-width:280px;height:auto;border-radius:14px;border:1px solid var(--line);}
        .about-body p{font-size:16px;line-height:1.85;color:var(--ink-2);margin-bottom:20px;}
        .about-more{margin-top:36px;padding:22px 26px;background:var(--copper-soft);border:1px solid var(--line);border-left:3px solid var(--copper);border-radius:0 12px 12px 0;}
        .about-more a{color:var(--copper);font-weight:700;font-size:15px;text-decoration:none;}
        .about-more a:hover{text-decoration:underline;}
      `}</style>
      <main className="page narrow">
        <h1 className="about-title">About me</h1>
        <div className="about-sep"></div>

        <div className="about-portrait">
          <img src="/me.png" alt="Michael" />
        </div>

        <div className="about-body">
          <p>My name is Michael and I&rsquo;m 41 years old. I&apos;ve been addicted to, primarily pornography, since I was around 10 years old. Porn was my first real addiction, followed by computer games, nicotine, alcohol, drugs (amphetamine and benzos primarily) in that order. Porn was always the main pillar of my addictions, and was also the hardest one to quit of them all, by far.</p>

          <p>I quit pornography (and following that, all other substances, drugs, alcohol) in February 2025. I&apos;ve been fully abstaining from all types of sexual pleasure since then in order to heal my brain and redirect my energy towards repairing my life, which is where I am at now, in the forge and repairing as well as building my life mission, &ldquo;Mission Phoenix&rdquo;. I write weekly newsletters that I send out to all my subscribers, containing reflections around pornography addiction, philosophies, ideas, suggestions, tips and anecdotes. There is no AI involved what so ever and I write them 100% myself.</p>

          <p>I&apos;ve just recently become an apprentice under Erik Sundby of &ldquo;DBK Sverige&rdquo; - Swedens first sexual addiction therapy clinic. On my free time I go to group classes doing Zumba, Aerobics dance and Yoga, as well as running and working out. I completed my first Vipassana meditation retreat in January 2026 (10 days of complete silence, 10 hours of meditating per day). I commute from Norrk&ouml;ping to Stockholm several days per week now to work with Erik and his patients to learn and soon be able to lead group therapy sessions myself. This is something that I am very, very passionate about.</p>

          <p>I&apos;m also training for my first Marathon this year. I started running in early August 2025 and it has become a daily staple for me now. In September 2025, I ran my first official race of 5km (I started out not even being able to run 100meters without stopping several times) at 33:11. December 31st 2025, I ran my second official 5km race with the time 23:38.</p>

          <p> I have a very clear life mission and life purpose, which is to spread awareness of the cost of pornography addiction, especially to younger men and boys in school. To travel around and talk about my life experience and what porn really costed me and took from me, as well as inspiring people struggling with it, through my own recovery. I want to be a person that I wish existed for me when I first found pornography.</p>
        </div>

      </main>
    </>
  );
}
