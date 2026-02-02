export const soilOptions = {
    coarse: [
      "Gravel",
      "Well graded sand and gravel",
      "Coarse or medium sand",
      "Well graded sand",
      "Fine or silty sand",
      "Chalk"
    ],
    fine: [
      "Peat",
      "Very soft clay",
      "Soft clay",
      "Firm clay",
      "Silt",
      "Stiff clay",
      "Chalk",
      "Very stiff clay",
      "Hard clay",
      "Organic clay",
      "Loam",
      "Stiff or hard glacial clay"
    ],
    manmade: [
      "Engineered coarse",
      "Engineered fine",
      "Rock fill",
      "Brick hardcore",
      "Slag fill",
      "Ash fill"
    ]
  }
  
  interface SoilProperties {
    loose: {
      yMoist: number
      ySat: number
    };
    dense: {
      yMoist: number
      ySat: number
    };
  }
  
  export const soilProperties: Record<string, SoilProperties> = {

    // Group A
    "Gravel": {
      loose: {
        yMoist: 16.0,
        ySat: 20.0
      },
      dense: {
        yMoist: 18.0,
        ySat: 21.0
      }
    },

    "Well graded sand and gravel": {
      loose: {
        yMoist: 19.0,
        ySat: 21.5
      },
      dense: {
        yMoist: 21.0,
        ySat: 23.0
      }
    },

    "Coarse or medium sand": {
      loose: {
        yMoist: 16.5,
        ySat: 20.0
      },
      dense: {
        yMoist: 18.5,
        ySat: 21.5
      }
    },

    "Well graded sand": {
      loose: {
        yMoist: 18.0,
        ySat: 20.5
      },
      dense: {
        yMoist: 21.0,
        ySat: 22.5
      }
    },

    "Fine or silty sand": {
      loose: {
        yMoist: 17.0,
        ySat: 20.0
      },
      dense: {
        yMoist: 19.0,
        ySat: 21.5
      }
    },

    // Group B
    "Very soft clay": {
      loose: {
        yMoist: 14.0,
        ySat: 14.0
      },
      dense: {
        yMoist: 18.0,
        ySat: 18.0
      }
    },

    "Loam": {
      loose: {
        yMoist: 12.5,
        ySat: 16.0
      },
      dense: {
        yMoist: 17.0,
        ySat: 19.0
      }
    },

    "Silt": {
      loose: {
        yMoist: 13.5,
        ySat: 18.0
      },
      dense: {
        yMoist: 18.0,
        ySat: 21.0
      }
    },

    "Chalk": {
      loose: {
        yMoist: 15.5,
        ySat: 18.5
      },
      dense: {
        yMoist: 19.5,
        ySat: 22.5
      }
    },

    "Soft clay": {
      loose: {
        yMoist: 15.0,
        ySat: 15.0
      },
      dense: {
        yMoist: 19.0,
        ySat: 19.0
      }
    },

    "Firm clay": {
      loose: {
        yMoist: 16.5,
        ySat: 16.5
      },
      dense: {
        yMoist: 20.5,
        ySat: 20.5
      }
    },

    "Stiff clay": {
      loose: {
        yMoist: 18.0,
        ySat: 18.0
      },
      dense: {
        yMoist: 22.0,
        ySat: 22.0
      }
    },

    "Very stiff clay": {
      loose: {
        yMoist: 18.5,
        ySat: 18.5
      },
      dense: {
        yMoist: 23.5,
        ySat: 23.5
      }
    },

    "Hard clay": {
      loose: {
        yMoist: 21.0,
        ySat: 21.0
      },
      dense: {
        yMoist: 24.0,
        ySat: 24.0
      }
    },

    "Peat": {
        loose: {
          yMoist: 12.0,
          ySat: 12.0
        },
        dense: {
          yMoist: 12.0,
          ySat: 12.0
        }
    },

    "Organic clay": {
        loose: {
          yMoist: 15.0,
          ySat: 15.0
        },
        dense: {
          yMoist: 15.0,
          ySat: 15.0
        }
    },

    "Stiff or hard glacial clay": {
        loose: {
          yMoist: 21.0,
          ySat: 21.0
        },
        dense: {
          yMoist: 21.0,
          ySat: 21.0
        }
    },

    // Group C
    "Engineered coarse": {
      loose: {
        yMoist: 16.0,
        ySat: 18.0
      },
      dense: {
        yMoist: 20.0,
        ySat: 22.0
      }
    },

    "Engineered fine": {
      loose: {
        yMoist: 17.5,
        ySat: 18.0
      },
      dense: {
        yMoist: 20.0,
        ySat: 20.0
      }
    },

    "Rock fill": {
      loose: {
        yMoist: 15.0,
        ySat: 19.5
      },
      dense: {
        yMoist: 17.5,
        ySat: 21.0
      }
    },

    "Brick hardcore": {
      loose: {
        yMoist: 13.0,
        ySat: 16.5
      },
      dense: {
        yMoist: 17.5,
        ySat: 19.0
      }
    },

    "Slag fill": {
      loose: {
        yMoist: 12.0,
        ySat: 18.0
      },
      dense: {
        yMoist: 15.0,
        ySat: 20.0
      }
    },

    "Ash fill": {
      loose: {
        yMoist: 6.5,
        ySat: 13.0
      },
      dense: {
        yMoist: 10.0,
        ySat: 15.0
      }
    }
  }