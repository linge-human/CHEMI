// Configuration object for constants
const CONFIG = {
    DEBUG: false, // Set to true for development
    MAX_CALCULATORS: 20,
    ANIMATION_DELAY: 100,
    STORAGE_KEYS: {
        WORKSPACE: 'vce-workspace',
        MODE: 'vce-mode',
        UNIT_STATES: 'vce-unit-states'
    },
    VALIDATION: {
        MIN_NUMBER: -999999,
        MAX_NUMBER: 999999,
        MIN_TEMPERATURE_C: -273.15,
        MAX_TEMPERATURE_C: 5000,
        MIN_PH: 0,
        MAX_PH: 14
    }
};