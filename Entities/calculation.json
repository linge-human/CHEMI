{
  "name": "Calculation",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "molar_mass",
        "molarity",
        "gas_law",
        "ph_calculation",
        "stoichiometry",
        "percent_composition"
      ],
      "description": "Type of chemistry calculation"
    },
    "inputs": {
      "type": "object",
      "description": "Input values for the calculation"
    },
    "result": {
      "type": "object",
      "description": "Calculated result and working steps"
    },
    "title": {
      "type": "string",
      "description": "Custom title for the calculation block"
    }
  },
  "required": [
    "type"
  ],
  "rls": {
    "read": {
      "created_by": "{{user.email}}"
    },
    "write": {
      "created_by": "{{user.email}}"
    }
  }
}
