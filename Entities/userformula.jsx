{
  "name": "UserFormula",
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Category for the formula (e.g., Stoichiometry, Custom)"
    },
    "formula": {
      "type": "string",
      "description": "The chemical or mathematical formula"
    },
    "variables": {
      "type": "string",
      "description": "Explanation of the variables in the formula"
    }
  },
  "required": [
    "category",
    "formula"
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
