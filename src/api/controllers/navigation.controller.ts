import { Response } from "express";
import { Logger } from "../../services";
import { IAuthenticatedRequest } from "../../core/interfaces/auth-request.interface";

const randomStoryGenerator = (req: IAuthenticatedRequest, res: Response) => {
    const characters = [
        {
            name: "Alex",
            role: "a courageous knight 🥷",
            backstory: "born into a family of farmers but destined for greatness after saving their village from raiders as a child",
            personality: "noble, determined, and loyal to a fault",
        },
        {
            name: "Luna",
            role: "a curious explorer 🕵️‍♂️",
            backstory: "an orphan who grew up reading forbidden scrolls in the library of an ancient monastery",
            personality: "clever, resourceful, and driven by an insatiable thirst for knowledge",
        },
        {
            name: "Eli",
            role: "a reclusive coding wizard 🧑‍💻",
            backstory: "a prodigy who accidentally created sentient AI while trying to fix a broken toaster",
            personality: "brilliant but socially awkward, with a dry sense of humor",
        },
        {
            name: "Zara",
            role: "a wandering artist 🎨",
            backstory: "a once-renowned painter who abandoned fame to seek inspiration in the world’s hidden corners",
            personality: "empathetic, imaginative, and deeply attuned to beauty in all its forms",
        },
        {
            name: "Orion",
            role: "a stargazing astronomer 🔭",
            backstory: "who discovered a mysterious celestial pattern that foretold a world-changing event",
            personality: "methodical, patient, and quietly courageous",
        },
        {
            name: "Mira",
            role: "a shapeshifting illusionist 🎭",
            backstory: "abandoned at a traveling circus as an infant and raised by performers with unusual talents",
            personality: "adaptable, unpredictable, with a flair for the dramatic",
        },
    ];

    const settings = [
        {
            location: "an enchanted forest 🌲",
            description: "where the trees hum ancient melodies and streams run with golden water",
            challenge: "a labyrinth of shifting paths that confound even the most experienced travelers",
        },
        {
            location: "a forgotten underwater city 🌊",
            description: "lit by bioluminescent corals and guarded by mysterious aquatic creatures",
            challenge: "pressure-filled tunnels and an ancient guardian that tests the worth of intruders",
        },
        {
            location: "a bustling futuristic metropolis 🏭",
            description: "with neon-lit skyscrapers and streets filled with both humans and sentient robots",
            challenge: "a corrupt corporation that controls the flow of information and resources",
        },
        {
            location: "a crumbling desert temple 🏜️",
            description: "hidden beneath dunes and filled with traps to protect its sacred treasures",
            challenge: "shifting sands and whispers of a curse that follows intruders out of the temple",
        },
        {
            location: "a floating archipelago of sky islands ☁️",
            description: "connected by bridges of solidified clouds and populated by beings who have never touched the ground",
            challenge: "rapidly changing weather patterns that can tear islands apart without warning",
        },
        {
            location: "a twilight dimension 🌓",
            description: "where day and night exist simultaneously, creating a realm of perpetual dusk and bizarre natural laws",
            challenge: "the gradual merging of dreams and reality that confuses travelers' perceptions",
        },
    ];

    const obstacles = [
        "an ancient guardian construct with riddles instead of weapons",
        "a geographical anomaly that defies the laws of physics",
        "a magical illness that spreads through spoken words",
        "a network of spies disguised as ordinary townspeople",
    ];

    const companions = [
        "a sarcastic talking animal with unexpected wisdom",
        "a child prodigy with knowledge beyond their years",
        "a reformed villain seeking redemption",
        "a mysterious stranger with unclear motives",
    ];

    const plot_twists = [
        "they discovered their true identity had been hidden from them their entire life",
        "their greatest enemy turned out to be a long-lost relative",
        "the artifact they sought had been within them all along",
        "their quest was based on a prophecy intentionally mistranslated centuries ago",
    ];

    const goals = [
        "to retrieve the Heart of Eternity, a gem said to grant infinite wisdom 💎",
        "to break the ancient curse that binds their homeland in eternal night 🌑",
        "to uncover the hidden blueprints of a device capable of restoring balance to a fractured world ⚙️",
        "to reunite two warring clans by recovering a stolen artifact of peace 🕊️",
        "to decode an ancient message believed to contain the secret of immortality 📜",
        "to find the source of a mysterious plague affecting only people with magical abilities 🧪",
    ];

    const conflicts = [
        "a shadowy rival who always seems one step ahead 🕶️",
        "a betrayal by someone they trusted with their life 💔",
        "a growing doubt in their own abilities as they face near-impossible odds 😓",
        "a moral dilemma that forces them to choose between their mission and their values ⚖️",
        "an environmental catastrophe threatening to destroy the very location they're trying to save 🌋",
        "a crisis of faith in the mission as new information comes to light 🔍",
    ];

    const resolutions = [
        "learning to trust others and working as a team to overcome the odds 👥",
        "sacrificing something deeply personal for the greater good 🛐",
        "uncovering a hidden strength within themselves to triumph against all odds 💪",
        "forming an unexpected alliance with a former enemy to achieve a shared goal 🤝",
        "discovering that the journey itself was more important than the destination 🧭",
        "finding an unconventional solution that no one had considered before 💡",
    ];

    const openingPhrases = [
        "In a world of wonder and peril 🌍",
        "In a realm where magic and danger intertwine ✨🧙‍♂️",
        "Amidst the whispers of an ancient prophecy 📜",
        "In a land forgotten by time 🏞️",
        "At the edge of the known universe 🌌",
    ];

    const missionPhrases = [
        "Their mission was clear 💎:",
        "The task set before them was undeniable ⚔️:",
        "Their goal, though daunting, was unshakable 💪:",
        "The call to adventure was undeniable 📯:",
        "Their purpose became crystal clear 💡:",
    ];

    const trialPhrases = [
        "After countless trials and moments of doubt 😔",
        "Following a path paved with hardships and uncertainty 🌪️",
        "Through a gauntlet of peril and sacrifice ⚔️",
        "Despite overwhelming odds and inner turmoil 💔",
        "Amidst challenges that tested their very soul 🔥",
    ];

    const storyStructures = [
        // Standard hero journey
        (elements: any) => `
            ${elements.opening} ${elements.character.name}, ${elements.character.role}, embarked on a journey like no other. 
            ${elements.character.backstory}. Known for being ${elements.character.personality}, ${elements.character.name} found themselves in ${elements.setting.location}, 
            ${elements.setting.description}.

            ${elements.mission} ${elements.goal}. Yet, the path was fraught with obstacles, the greatest of which was ${elements.conflict}.
            
            Along the way, they encountered ${elements.companion}, who proved invaluable when facing ${elements.setting.challenge}.
            
            ${elements.trial}, ${elements.character.name} discovered that ${elements.plot_twist}. This revelation changed everything.
            
            In the end, they learned that ${elements.resolution}, forever transforming their understanding of their world.
        `,

        // Mystery structure
        (elements: any) => `
            ${elements.opening} a mystery unfolded that would change everything for ${elements.character.name}, ${elements.character.role}.
            
            It began in ${elements.setting.location}, ${elements.setting.description}, when ${elements.character.name} discovered ${elements.goal.replace("to ", "")}.
            
            Despite being ${elements.character.personality}, they couldn't ignore the strange events occurring around them. ${elements.setting.challenge} made their investigation nearly impossible.
            
            With the help of ${elements.companion}, they pursued clues and overcame ${elements.obstacle}. ${elements.conflict} threatened to end their quest prematurely.
            
            ${elements.trial}, the truth emerged: ${elements.plot_twist}.
            
            The mystery solved, ${elements.character.name} realized that ${elements.resolution}.
        `,

        // Survival story
        (elements: any) => `
            Disaster struck in ${elements.setting.location}, ${elements.setting.description}. ${elements.character.name}, ${elements.character.role}, found themselves fighting for survival.
            
            ${elements.character.backstory} had prepared them somewhat, but nothing could fully ready anyone for ${elements.setting.challenge}.
            
            Their immediate goal became clear: ${elements.goal}. But ${elements.conflict} complicated everything.
            
            Fortunately, they weren't completely alone. ${elements.companion} shared their dangerous journey, helping them overcome ${elements.obstacle}.
            
            ${elements.trial}, a shocking revelation changed everything: ${elements.plot_twist}.
            
            ${elements.character.name}, being ${elements.character.personality}, ultimately survived by ${elements.resolution}.
        `
    ];

    try {
        // Select elements with weighted randomness to reduce repetition
        const getRandomElement = <T>(array: T[], recentlyUsed: T[] = []): T => {
            // Filter out recently used items if possible
            const availableItems = array.filter(item => !recentlyUsed.includes(item));
            const sourceArray = availableItems.length > 0 ? availableItems : array;
            return sourceArray[Math.floor(Math.random() * sourceArray.length)];
        };

        // Track recently used elements (would normally be stored in session/db)
        const recentlyUsed = {
            characters: [],
            settings: [],
            plots: [],
        };

        // Get all story elements
        const opening = getRandomElement(openingPhrases);
        const mission = getRandomElement(missionPhrases);
        const trial = getRandomElement(trialPhrases);
        const character = getRandomElement(characters, recentlyUsed.characters as any);
        const setting = getRandomElement(settings, recentlyUsed.settings as any);
        const goal = getRandomElement(goals);
        const conflict = getRandomElement(conflicts);
        const resolution = getRandomElement(resolutions);
        const obstacle = getRandomElement(obstacles);
        const companion = getRandomElement(companions);
        const plot_twist = getRandomElement(plot_twists);

        // Choose a story structure
        const storyTemplate = getRandomElement(storyStructures);

        // Generate the story using the selected template
        const storyElements = {
            opening, mission, trial, character, setting,
            goal, conflict, resolution, obstacle, companion, plot_twist
        };

        const story = storyTemplate(storyElements);

        // Record used elements to avoid repetition in subsequent calls
        // In a real implementation, you'd store these in a database or session

        res.json({
            error: false,
            story: story.trim(),
            character,
            setting,
            goal,
            conflict,
            resolution,
            obstacle,
            companion,
            plot_twist
        });
    } catch (error: any) {
        Logger.error('Error generating story', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.json({
            error: true,
            msg: 'Error generating story',
            actualError: error.message
        });
    }
};

export default {
    randomStoryGenerator,
};
