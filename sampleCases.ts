import { SampleCase } from '../types';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-news-misinfo',
    title: 'Suspicious Viral Health Article',
    mode: 'news',
    tag: 'Fake News / Misleading',
    description: 'Sensational article claiming suppressed miracle mineral cure with anonymous sources and unsupported medical claims.',
    data: {
      headline: 'Miracle Himalayan Crystal Compound Reverses Cellular Aging in 48 Hours — Suppressed by Global Health Agencies',
      sourceUrl: 'https://healthmiracle-uncensored-news.org/story/9924',
      articleText: `In an explosive underground report leaked earlier this week by an anonymous former senior pharmaceutical researcher, a revolutionary naturally occurring mineral crystalline salt found exclusively in secluded Himalayan caves has been documented to reverse cellular biological aging by up to 15 years in under 48 hours.

According to the whistleblower, who declined to be named out of fear of official retaliation, clinical trials conducted across over 10,000 subjects yielded a 100% cure rate for systemic metabolic inflammation and chronic fatigue. Yet, major regulatory agencies have quietly classified the research and banned importation of the compound to protect multi-billion dollar legacy therapeutics.

"The medical establishment does not want you to know about this," stated Dr. Marcus Vance, described on social media as an independent alternative biophysicist with no institutional affiliation. Medical experts urge citizens to stockpile the compound immediately before international borders freeze remaining shipments.`
    },
    sampleReport: {
      assessment: 'Potentially Misleading',
      confidence: 89,
      truthScore: 18,
      summary: 'High probability of medical misinformation. The article deploys classic conspiratorial rhetoric ("suppressed by agencies", "whistleblower"), makes biologically implausible claims of 100% cure rates within 48 hours, and provides zero peer-reviewed citations or verifiable clinical trial registrations.',
      claims: [
        {
          claim: 'Himalayan mineral reverses biological aging by 15 years in 48 hours.',
          assessment: 'Potentially Misleading',
          reason: 'Biologically impossible mechanism; no clinical trial exists in PubMed, Cochrane Library, or WHO clinical trial registries.',
          verificationSteps: 'Query the ClinicalTrials.gov registry for registered human trials on the named substance.'
        },
        {
          claim: '10,000 subjects yielded a 100% cure rate for systemic inflammation.',
          assessment: 'Potentially Misleading',
          reason: '100% efficacy across 10,000 subjects is a recognized statistical hallmark of fraudulent medical advertising.',
          verificationSteps: 'Search peer-reviewed medical databases (e.g. PubMed/MEDLINE) for published study results.'
        },
        {
          claim: 'Major regulatory agencies classified the research to protect pharmaceutical profits.',
          assessment: 'Needs Verification',
          reason: 'Unsubstantiated conspiratorial assertion attributed solely to an unnamed anonymous individual.',
          verificationSteps: 'Check public regulatory agendas and notices from FDA, EMA, or WHO.'
        }
      ],
      indicators: [
        { name: 'Sensational Language', status: 'alert', detail: 'Contains urgent, fear-inducing calls to action ("stockpile immediately", "explosive leak").' },
        { name: 'Source Attribution', status: 'alert', detail: 'Relies primarily on an unnamed anonymous whistleblower and an unaffiliated social media commentator.' },
        { name: 'Scientific Plausibility', status: 'alert', detail: 'Claims biological age reversal in 48 hours with 100% efficacy across 10,000 subjects.' },
        { name: 'Internal Consistency', status: 'warning', detail: 'Claims complete suppression yet claims 10,000 subjects were tested openly.' }
      ],
      evidence: [
        {
          source: 'World Health Organization (WHO)',
          headline: 'Guidelines on Evaluating Unsubstantiated Health & Anti-Aging Claims',
          finding: 'WHO cautions against products advertising immediate reverse-aging and 100% curative guarantees.',
          type: 'contradicting'
        },
        {
          source: 'PubMed / NIH Database',
          headline: 'Search: Himalayan Crystalline Mineral Longevity Trials',
          finding: 'Zero peer-reviewed publications or registered clinical trial numbers found matching the specified protocol.',
          type: 'contradicting'
        }
      ],
      verificationSteps: [
        'Check ClinicalTrials.gov or the WHO International Clinical Trials Registry Platform (ICTRP) for legitimate registered trials.',
        'Review the FDA Warning Letters database for enforcement actions against unauthorized anti-aging supplements.',
        'Consult reputable academic medical centers (e.g., Mayo Clinic, Johns Hopkins Health) on cellular aging research.'
      ],
      limitations: [
        'AI analyzes textual indicators, rhetorical manipulation, and absence of verifiable citations; laboratory chemical analysis is required for definitive physical sample confirmation.',
        'Always consult licensed healthcare professionals before making medical decisions.'
      ],
      explainableAI: 'This article was classified as "Potentially Misleading" (Truth Score: 18/100) due to extreme medical hyperbole, absence of verifiable scientific methodology, reliance on anonymous authority, and classic scam marketing pressure tactics.'
    }
  },
  {
    id: 'sample-news-reliable',
    title: 'Verified Scientific News Release',
    mode: 'news',
    tag: 'Reliable Scientific Report',
    description: 'Well-sourced astronomy report with named institutions, peer-reviewed citations, and measured scientific language.',
    data: {
      headline: 'NASA James Webb Space Telescope Detects First Definitive Evidence of Carbon Dioxide in Exoplanet Atmosphere',
      sourceUrl: 'https://www.nasa.gov/press-release/webb-detects-first-evidence-of-carbon-dioxide-in-exoplanet-atmosphere',
      articleText: `NASA's James Webb Space Telescope has provided the first clear, unambiguous evidence for carbon dioxide in the atmosphere of a planet outside the solar system. The gas giant exoplanet, WASP-39 b, orbits a Sun-like star roughly 700 light-years away in the constellation Virgo.

The findings, accepted for publication in the journal Nature, demonstrate the capability of Webb's Near-Infrared Spectrograph (NIRSpec) instrument to detect key atmospheric components on exoplanets. Previous observations from the Hubble and Spitzer space telescopes had revealed the presence of water vapor and sodium, but could not confirm carbon dioxide.

"Detecting such a clear signal of carbon dioxide on WASP-39 b bodes well for the detection of atmospheres on smaller, terrestrial-sized planets in the future," said Natalie Batalha of the University of California, Santa Cruz, who leads the Transiting Exoplanet Community Early Release Science team. The observations utilized transmission spectroscopy during a 3.5-hour transit across the host star.`
    },
    sampleReport: {
      assessment: 'Likely Reliable',
      confidence: 94,
      truthScore: 92,
      summary: 'High credibility indicators throughout. The article attributes findings to named academic researchers, cites a peer-reviewed journal (Nature), describes specific observational methodologies (transmission spectroscopy, NIRSpec instrument), and maintains restrained, objective scientific tone.',
      claims: [
        {
          claim: 'JWST detected carbon dioxide on exoplanet WASP-39 b.',
          assessment: 'Likely Reliable',
          reason: 'Published in peer-reviewed journal Nature by the JWST Transiting Exoplanet Community team.',
          verificationSteps: 'Check Nature journal archive (DOI: 10.1038/s41586-022-05269-w).'
        },
        {
          claim: 'WASP-39 b is a gas giant 700 light-years away orbiting a Sun-like star.',
          assessment: 'Likely Reliable',
          reason: 'Consistent with standard astronomical catalogs (SIMBAD, NASA Exoplanet Archive).',
          verificationSteps: 'Cross-reference with the NASA Exoplanet Archive catalog entry for WASP-39 b.'
        }
      ],
      indicators: [
        { name: 'Source Attribution', status: 'pass', detail: 'Specific named researcher (Natalie Batalha, UC Santa Cruz) and affiliated research team cited.' },
        { name: 'Scientific Restraint', status: 'pass', detail: 'Uses measured language, notes previous work by Hubble/Spitzer, and clarifies limitations.' },
        { name: 'Methodological Transparency', status: 'pass', detail: 'Details the exact instrument (NIRSpec) and method (transmission spectroscopy).' },
        { name: 'Sensational Language', status: 'pass', detail: 'Absence of sensationalist or hyperbolic framing.' }
      ],
      evidence: [
        {
          source: 'Nature (Scientific Journal)',
          headline: 'Identification of carbon dioxide in an exoplanet atmosphere',
          finding: 'Full peer-reviewed paper corroborating the spectroscopic transit data and carbon dioxide absorption peaks.',
          type: 'supporting'
        },
        {
          source: 'NASA Official Mission Archives',
          headline: 'JWST Early Release Science Program 1366 Data Release',
          finding: 'Raw spectrographic data publicly available in the Barbara A. Mikulski Archive for Space Telescopes (MAST).',
          type: 'supporting'
        }
      ],
      verificationSteps: [
        'Verify publication record on Nature.com or arXiv preprint server.',
        'Review the press kit on NASA.gov or ESA (European Space Agency) portals.'
      ],
      limitations: [
        'Independent observational corroboration by other space telescopes remains limited to JWST instrumentation capabilities.',
        'Assessment confirms consistency with published institutional literature.'
      ],
      explainableAI: 'This report was classified as "Likely Reliable" (Truth Score: 92/100) due to verifiable named institutional sources, reference to peer-reviewed literature, detailed methodology, and non-sensational phrasing.'
    }
  },
  {
    id: 'sample-image-manipulation',
    title: 'Manipulated Image / Deepfake Face-Swap',
    mode: 'faceswap',
    tag: 'Image Deepfake / Blend Artifacts',
    description: 'High-resolution image exhibiting synthetic facial boundary blending, misaligned specular lighting, and skin texture diffusion smoothing.',
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      metadata: {
        camera: 'Unknown / Stripped EXIF',
        software: 'Unknown / Resaved in Web Editor',
        resolution: '1024x1024'
      }
    },
    sampleReport: {
      assessment: 'Potentially Manipulated',
      confidence: 84,
      manipulationScore: 78,
      summary: 'Significant biometric and pixel-level anomalies detected. Analysis shows localized boundary feathering along the jawline, conflicting specular reflection angles inside the pupils compared to background lighting, and abnormal lack of microscopic skin pores across the central facial triangle.',
      detectedEvidence: [
        'Jawline border exhibits micro-blurring and pixel interpolation mismatch relative to neck collar.',
        'Bilateral iris corneal reflections point at 45 degrees, whereas the primary ambient shadow falls directly downward.',
        'High-frequency sensor noise is completely absent across the cheeks and forehead but present in the hair and background.'
      ],
      aiInference: [
        'High likelihood of a modern deepfake face-swap or inpainting blend (e.g. RoOP, SimSwap, or Stable Diffusion Inpaint).',
        'Facial boundary was likely feathered and pasted over an existing body double.'
      ],
      indicators: [
        { name: 'Boundary & Blending Integrity', status: 'alert', detail: 'Abrupt transition between facial composite mesh and background hair strands.' },
        { name: 'Lighting & Specular Coherence', status: 'warning', detail: 'Corneal highlight vector does not match the ambient room illumination vector.' },
        { name: 'Sensor Noise Floor', status: 'alert', detail: 'Severe localized noise disparity between face (smoothed) and background (textured).' },
        { name: 'Biometric Symmetry', status: 'pass', detail: 'General facial proportions match natural anatomical limits.' }
      ],
      reviewRegions: [
        { x: 28, y: 20, width: 44, height: 48, label: 'Facial inpainting & pore-smoothing zone', severity: 'high' },
        { x: 24, y: 64, width: 52, height: 18, label: 'Jaw-to-collar boundary feathering artifact', severity: 'high' },
        { x: 38, y: 32, width: 24, height: 14, label: 'Pupillary specular reflection angle mismatch', severity: 'medium' }
      ],
      verificationSteps: [
        'Perform reverse visual search using Google Lens, TinEye, and Yandex to trace the original body photograph.',
        'Use error level analysis (ELA) or raw sensor noise profile extractors to confirm compression differences.',
        'Request original camera RAW file containing cryptographically signed C2PA provenance metadata.'
      ],
      limitations: [
        'Commercial image compression (JPEG/WebP) and heavy portrait beauty filters can occasionally simulate skin smoothing artifacts.',
        'Deep learning forensic models provide probabilistic indicators, not legal proof of tampering.'
      ],
      explainableAI: 'Classified as "Potentially Manipulated" (Manipulation Score: 78/100) due to discordant noise signatures between the face and background canvas, combined with boundary ghosting along the lower jaw.'
    }
  },
  {
    id: 'sample-text-ai',
    title: 'Synthetic AI-Generated Article',
    mode: 'text',
    tag: 'AI-Generated Text Detection',
    description: 'Polished text exhibiting uniform burstiness, formulaic transitions, and lack of human idiosyncratic vernacular.',
    data: {
      text: `In today's rapidly evolving technological landscape, the intersection of artificial intelligence and digital forensic methodology has become increasingly paramount. It is crucial to recognize that technological advancements offer both unprecedented opportunities and multifaceted challenges for modern societies.

Furthermore, when evaluating the societal ramifications of automated content generation, one must examine the diverse perspectives held by industry stakeholders. On one hand, generative models streamline workflow efficiencies and democratize creative production. On the other hand, the proliferation of synthetic media poses undeniable risks to informational integrity.

In conclusion, as we navigate this dynamic digital frontier, fostering a culture of critical digital literacy while implementing ethical regulatory guardrails will be essential to ensuring that technological progress continues to serve the collective human interest.`
    },
    sampleReport: {
      assessment: 'Likely Synthetic / AI-Generated',
      confidence: 86,
      aiLikelihood: 88,
      summary: 'The submitted text demonstrates exceptionally high hallmarks of Large Language Model composition: uniform sentence length variance (low burstiness), textbook rhetorical transitions ("In today\'s rapidly evolving", "Furthermore", "On one hand... on the other hand", "In conclusion"), and generic, non-committal pros-and-cons summarization devoid of specific names, dates, or personal experience.',
      indicators: [
        { name: 'Syntactic Burstiness', status: 'alert', detail: 'Variance in sentence length is under 12%, characteristic of neural autoregressive generation.' },
        { name: 'Formulaic Transitional Phrasing', status: 'alert', detail: 'High concentration of clichéd rhetorical connectors ("paramount", "multifaceted", "dynamic frontier").' },
        { name: 'Specificity & Factual Density', status: 'warning', detail: 'Zero concrete citations, named individuals, specific events, or empirical data points.' },
        { name: 'Perplexity Homogeneity', status: 'alert', detail: 'Token transition predictability is consistently uniform across every paragraph.' }
      ],
      patterns: [
        'Classic 3-part essay structure (Intro with generic claim, balanced pros-and-cons body, moralistic concluding paragraph)',
        'Heavy use of LLM filler vocabulary ("paramount", "multifaceted", "dynamic digital frontier", "testament to")',
        'Absence of colloquialisms, personal voice, or real-world anecdotes'
      ],
      verificationSteps: [
        'Ask the author to provide specific real-world case studies or lived experiences regarding the topic.',
        'Review original draft version history or revision timestamps if assessing student or professional work.'
      ],
      limitations: [
        'AI text detection is probabilistic, not deterministic. Highly structured formal human academic writing can occasionally trigger false positives.',
        'Never use AI likelihood scores as sole disciplinary evidence.'
      ],
      explainableAI: 'Assessed with an "AI-generation likelihood" of 88% due to characteristic token predictability, formulaic transitions, and lack of human idiosyncratic writing variation.'
    }
  },
  {
    id: 'sample-audio-voiceclone',
    title: 'Synthetic Voice Clone / Audio Deepfake',
    mode: 'audio',
    tag: 'Voice Deepfake / Synthetic Speech',
    description: 'Voicemail sample mimicking an executive demanding urgent wire transfer with abnormal lack of biological breathing and robotic pitch contours.',
    data: {
      audioName: 'urgent_ceo_wire_request.wav',
      metadata: {
        duration: '14 seconds',
        sampleRate: '44.1 kHz',
        channels: 'Mono'
      }
    },
    sampleReport: {
      assessment: 'Potentially Synthetic Voice',
      confidence: 85,
      syntheticScore: 82,
      transcript: "Good morning David, this is Robert calling from the airport terminal. I need you to execute the vendor milestone wire payment to the overseas account before 2 PM today without delay. My cell battery is dying so follow the PDF memo directly.",
      summary: 'Acoustic inspection reveals clear signs of a neural text-to-speech voice clone. Spectral analysis demonstrates completely absent respiratory inhalation acoustic cues across 14 seconds of speech, flat robotic pitch inflection at sentence terminations, and sterile zero-reverberation background audio inconsistent with an airport terminal.',
      indicators: [
        { name: 'Biological Respiration & Breath Dynamics', status: 'alert', detail: 'Zero audible inhalations or respiratory pauses across the entire speech envelope.' },
        { name: 'Prosodic Intonation & Cadence', status: 'alert', detail: 'Pitch contour drops at identical geometric slopes on every clause ending.' },
        { name: 'Room Acoustic & Environmental Reverb', status: 'alert', detail: 'Caller claims an airport terminal, yet the acoustic recording has zero ambient noise or impulse response.' },
        { name: 'Vocoder & Phase Consistency', status: 'warning', detail: 'Micro-metallic phase artifacts detected in high frequencies above 7.5 kHz.' }
      ],
      detectedEvidence: [
        'Acoustic signal has a synthetic noise floor with instantaneous volume cuts to absolute zero between words.',
        'Claimed airport terminal environment has 0 dB ambient sound pressure level.'
      ],
      aiInference: [
        'Likely cloned using a modern few-shot voice model (e.g. ElevenLabs, VALL-E, or XTTS) targeted for executive impersonation / business email compromise (BEC).',
        'Audio was paired with a false caller context to induce artificial panic.'
      ],
      verificationSteps: [
        'Immediately contact the executive through an out-of-band verified secondary channel (e.g. verified corporate phone number or in-person).',
        'Never execute financial wire requests based on unverified voice memos or voicemail messages.'
      ],
      limitations: [
        'Studio noise gates can suppress background sounds, but complete lack of breath dynamics strongly points toward voice synthesis.',
        'Lossy cellular telephone codecs can distort acoustic frequencies.'
      ],
      explainableAI: 'Classified as "Potentially Synthetic Voice" (Synthetic Score: 82/100) due to contradictory environmental claims, absent respiratory acoustics, and characteristic neural vocoder phase artifacts.'
    }
  },
  {
    id: 'sample-video-dubbing',
    title: 'Lip-Sync & Video Dubbing Mismatch',
    mode: 'dubbing',
    tag: 'Video Dubbing / Audio-Visual Desync',
    description: 'Video snippet where original speech track was replaced with AI-generated audio, causing phoneme-viseme temporal desynchronization.',
    data: {
      videoName: 'press_briefing_statement_snippet.mp4',
      metadata: {
        resolution: '1920x1080',
        framerate: '30 fps',
        duration: '12 seconds'
      }
    },
    sampleReport: {
      assessment: 'Potentially Manipulated',
      confidence: 81,
      manipulationScore: 74,
      summary: 'Lip-sync and facial temporal analysis detected unnatural desynchronization between acoustic speech envelopes and mouth viseme shapes. The video shows localized boundary softening around the lips during bilabial consonants (/b/, /p/, /m/) where audio precedes physical mouth contact by over 160ms.',
      timeline: [
        { time: '00:00 - 00:03', status: 'pass', event: 'Natural facial movement and posture during initial pause.' },
        { time: '00:04 - 00:07', status: 'alert', event: 'Bilabial plosive audio plays while lips remain partially parted (160ms phoneme-viseme offset).' },
        { time: '00:08 - 00:12', status: 'warning', event: 'Subtle boundary blurring and skin texture warping around lower jaw during rapid articulation.' }
      ],
      indicators: [
        { name: 'Phoneme-Viseme Synchronization', status: 'alert', detail: 'Audio speech envelope leads visual mouth deformation by ~5 frames (166ms).' },
        { name: 'Perioral Texture Stability', status: 'warning', detail: 'Local blurred zone bounded tightly around oral cavity while cheeks remain sharp.' },
        { name: 'Temporal Inter-Frame Consistency', status: 'warning', detail: 'Micro-jitter observed in chin contour during speech bursts.' },
        { name: 'Blink & Gaze Dynamics', status: 'pass', detail: 'Eye movements and blinking remain natural and consistent with original base video.' }
      ],
      detectedEvidence: [
        'High-speed frame review shows mouth closed at 00:05.12, but the spoken syllable "re-" has already finished playing.',
        'High-pass filter reveals distinct compression block boundary around the mouth rectangle.'
      ],
      aiInference: [
        'Consistent with AI lip-sync re-targeting systems (such as Wav2Lip or SadTalker) applied to existing authentic broadcast footage to alter spoken words.',
        'The body and eyes are authentic, but the mouth movement was synthetically re-rendered.'
      ],
      verificationSteps: [
        'Locate the original broadcast from the official television network or official government archive.',
        'Compare the audio transcript with the official published verbatim transcript of the event.'
      ],
      limitations: [
        'Bluetooth audio lag or poor streaming transcoding can occasionally create global audio desync, but localized mouth blending artifacts distinguish synthetic dubbing from encoding lag.',
        'Always verify with the official unedited source footage.'
      ],
      explainableAI: 'Classified as "Potentially Manipulated" (Dubbing Mismatch Score: 74/100) due to localized oral boundary artifacts and severe phoneme-viseme temporal disconnect.'
    }
  }
];
