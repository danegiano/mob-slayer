const GameState = {
    health: 100,
    maxHealth: 100,
    comboUnlocked: false,
    storyPhase: 0,          // 0=start, 1=found sword, 2=talked to blacksmith, 3=night
    swordPowers: [],
    gold: 0,
    attackBonus: 0,
    villageQuests: {
        delivery: 'none',     // none -> active -> done
        ingredients: 'none',  // none -> active -> done (count tracks items)
        ingredientCount: 0,
        lostToy: 'none',      // none -> active -> done
        timeChallenge: 'none', // none -> active -> done
        escort: 'none'        // none -> active -> walking -> done
    },
    villageShop: {
        attackBoost: false,    // +10 attack for 100g
        hpBoost: false,        // +50 max HP for 75g
        speedBoost: false      // +30 speed for 120g
    },
    quests: {
        tundra: { wolves: false, amulet: false, blizzard: false, miniGame: false },
        darkforest: { mushrooms: false, villager: false, nest: false, miniGame: false },
        ruins: { bridge: false, scroll: false, runes: false, miniGame: false }
    },
    shopUpgrades: {
        tundra: { maxHp: false, attack: false },
        darkforest: { maxHp: false, attack: false },
        ruins: { maxHp: false, attack: false }
    },
    equipment: {
        sword: 'wood',
        armor: 'none'
    },
    inventory: {
        swords: ['wood'],
        armors: ['none']
    },
    chests: {
        woodsNightFire: false,
        snowCaveIce: false
    }
};

const SPRITE_DATA = {
    player: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAgCAYAAAD9qabkAAACL0lEQVR4nO3cv0oDQRDH8ShWaRVLWwUrUwkGSwsFsRIUwSZPIER9BP+ATxBbbcXCIqWksIqVRdqUom060XonsMO4ent38/10Fy77W++WYcc7nWkorg9Xv7VzYrp3bzMp369afmpe2fKl3PMpOr9q68+aP5syOIBqowAAjlEAAMem+oPUnkOj9SR1y7f2gLnzpdzzKTq/butPy2cHADhGAQAcowAAjs3JD46PdoLjzZPH4Pj5Zjc6oHZ+9+4t+v3c+bfDL1OetLh9ldRz586XZM/4/nRq6lHl/ahaft2xAwAcowAAjlEAAMfUftHac0mpPWnZ8/+65y5bvib3/P47v+zrLzWfHQDgGAUAcIwCADg21R+0Oi/RnmPyMY4O2FxYCscb7wfHvf442pMUnX99thfk3X+eR8eX+TJv2Fu3veueOd9K3h9tPtLB/EVw3L18MM33v/O9rX92AIBjFADAMQoA4NjU3wJotB5LWl5rhR/04z1M3fL/Wu58Kfd8is6v2vrT8tkBAI5RAADHKACAY1O/A5DPkdvtvbT/UbZhO73o/NHrMMzv2/IHA9tzbC2/OQmfU8vx5XxS862s90fOr7W1lHQ/tXzteo2a4fW2jm9W8vXPDgBwjAIAOEYBABxT3wNYaYQ9U28Qf5e50w57vO5l/Hzt+73EHnelEe85tXez5c8vDX4xp1h+p90Ie1plPqn5qazXR7veqfna9bLm1339swMAHKMAAI5RAADHfgDv9DW4scNfxgAAAABJRU5ErkJggg==',
    player_slayer: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAgCAYAAAD9qabkAAACKElEQVR4nO3bsU4CQRDGcTFW1sYSWxM7GilOH0ATY21MbKgojfoQSiytsLXVWPgASgEF1/EClMbazmC9Q7KTdYTlbv6/7gjctx6byX05bKwp7s72Ztp7Yq6fJg3L56uWb81btXwp93qWnV+1/Zeav245OYBqYwAAjjEAAMfm+oG1c2i0TlK3/NQOmDtfyr2eZefXbf9p+dwBAI4xAADHGACAYxvyhYvz4+D48PI1OH6/P4meUHv/9dMk+vnc+Y/lT1KetH10a+rcufMl2Rk/326SOqr8PqqWX3fcAQCOMQAAxxgAgGNqX0ztXJK1k656/n937lXL1+Re36LzV33/WfO5AwAcYwAAjjEAAMfm+kGrM4x2ju+vafSEm1vN4Hjc6YaB7TLaSZadP2zNgrxuaxQ9v8yXeWW/ndT5cuenkt+Pth7podwPjttlI2m9i873tv+5AwAcYwAAjjEAAMfm/hdAo3UsadQdi1dsFbVq+f8td76Uez3Lzq/a/tPyuQMAHGMAAI4xAADH1EJSFKem3yL3vp+D49TnvovOnw1bwfnlc1ItfzB4MZU6mX9wFXY8eX65Hmu+Ver10a63NV+7Xh+98Dm6ll/3/c8dAOAYAwBwjAEAOKb+DmB3rQyO+4NptMN0imbQWVI7j/x839hx+8VOtENpHVD+/dLgD2uK5XeKr7DTKuux5lulXh9r59fytevVaMf3r3b+uu1/7gAAxxgAgGMMAMCxXzLIMrgK1m1kAAAAAElFTkSuQmCC',
    goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB0klEQVR4nO1XIXPCMBh93W0mJqYGw2wN2JkZNJhZ9BQGg+EXYDAzqJkZfgGYGQxiGkzEzGYwNTW1mRhhSZN+Tdfsxu727rhLwuN7ecn3fS0RCDDGJfW9Qp5nkQ/PFbszT0jefiJIjcsQAoxxWccEY1x25slpc/uJQH/VMzjrweakfeQ6NS4oAX2T7aRlfJS4EvC9rWJsAOivepiNBGajz5izkcCu3TI4ZRqWgdACReR5FunmFaaLBNNFYo0V9hPhTCMrhY4Clgk94GksDpUChAnD7HqwMTh6SlGxnTUQUqAMeZ5F+o29vtxgnDIAwEOcY5yaXADY7d5kt3tt6JQWcSgBH7yLA+4AABkAGGMFxrgUwm4YpQZCCVTBVQ8uHGNasSsNNBUooljo8TBGss3QjpnFfU6ukC5TsjlYBkILuKAahO/hUM8i5w2EFPhpOB9k54rt09haC2rAJRASj5uDtebVhZoIuFBMTXHLQSUrlcpWx3AVMYV0mRrzui91PjwqZq2W9x2BKjDGpTokdRj6vCo2WQPqx/EwNm5CnzfZfAj8qS7kwp83ELQL1YWqsWIj0OdV71a/WsSMcXnf+/pjpNpwca2RgaYCVfF9eGd7A/8A8AF5OD9bBXRTPAAAAABJRU5ErkJggg==',
    blacksmith: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAACPUlEQVR4nO1Zr0/DQBT+SsDMzMw8c+GH2X9Qg5hCLgQ5OcGCAUeCmSAkYJlpZpCTZEGiEJj+BzNjpOZMzczsIchGB213be96ZL3P3b27+16+e/fu9QpYVBtO1gmd46bYNGb0Psm8rin+HdXkWcZlhQ7+TAJsI3ZlBzIicXfdkV74feqJgHNlR0EXv7QA2wBGtHY0As6dXAK0eh4A4G14IdWvGnn4GZG4vX9c6+vfXIlcAkQJPmcB9g9YIrEOqORXkgQ/Z4GKZYzwF8oBy5ADytt91fyZsvTvJJIGlTeACv64uQHnTm4nP15u/yx42O5rqwCL8jMi0XHrAICRP18JFDuBEYlLlxS5+oOBz6UiQwf/wOeIE8BWgr87GJGIJpRWz8NyN17nNYThXGrhRqOOk/oCwLf6b8MLnHUBAKLV8xIjQQf/WfcUA9+LHVdqJRjN2oxIaamcF2sCpKlfBJcuodXzEFeJRUXQxf/8NP7Tt9wAmwNMO1AWopF13v05jjYCyiTr31yttf9DEiw1AjpufVWM/BdIRcBkEQIA2B7ApJPyHJPvaxjNWiOHa+Xw2xwgM2ipYN5KrCh08lfmGkz6UrRHINoIOHcO2/1VO8sDhAwexul/bHTyJ317pEZAwLkz8Hlhctl3ABP8lT8ClRdAKiwZkWgeubG2ydRHmk1FuauTv/IRYAUw7YBpWAFMO2AalRdA6i9No5ZsDxfAJnuRq1A3f+UjwApg2gHTkHoQCTc8rGyyF4VpfgsLi+3FF8qCLOEZpC40AAAAAElFTkSuQmCC',
    night_goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB5UlEQVR4nO1WIXDCMBR93W0mJmYGU4PB1NRQMTMzhcCgsPjaqenZ+llUDQKFGAbBDAZTU1ODmamJmejECGuaNE3X7AZ3e3fckeT3v7z8/Nc60IAQWujWORjLHZM4Ve7exNXGHeJMy3Ftg4AQWrQRQQgtehP3tLnh2kM6S4WY/ksfb/d78D0c4kzJcaUj4BiuPdz2ifAbrr3Tem/iGlermhsA0lmK7W6LaBEBAKJFhLk/F2LqOCQBtgmqYCx3+MmXEfgBwnEIAAjHIQI/ENYPcaa8RtIVOhJIIgI/AHycCL6UNRNoRAhi98+JEOM9DoxyK3vAJkEdGMudcsVelx7CzQcAILq7Of3nsQCwXG6L0SgQeGqb2BaBCd5ThmmpmtNUjiGEFkmSSIZRK8AWQRNU/aDCMaeUu1FAV4Iqqo1OfIpB4sIlsl2v3A3YLteagyTANoEK3CBMD0f3LlJWwCbBb0P5IjtXbOInac6qABWBTaz2uTRn5EJdCFSoXs1kkCFB/XXVXWXJMVRNrAPbiZtu+1FnEqfL2cryfkLQBEJowQ+JH0Z53JRb2wP8YeJToRLlcZfN28BFuZAKFy/Aqgu1Be8xyQhK46Zvqz9tYkJo8eB99xa34epcJwFdCZrym8SdbQX+AeATVatCb5qONgIAAAAASUVORK5CYII=',
    troll: 'data:image/png;base64,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',
    ice_wolf: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAA9ElEQVR4nGNgGAXDBHz48f8/NjarzWeipeHUAvjMp4oHBhIwwhjIPhPgYGTErhwTEApxmFm0Mp+JGEWUAlqaT7Uk9MZAEyub1uZjRC8DAwPDkSfEG2wjg8pH1+ujwshIS/NZGBhQ0+SWO9SPblqaP+RLIZp5oCMhkFZGo5hPMw9ULFhPK6NRzGehtsHomY7W5lPsAWylDqVmkmL+oMjENx49Z7jx6DlOPj4wKDxACcDpAeRQwBdCpIQWLvMpUYfhAUrSMDF6qW0+1kzso8LI2LPv2X9sbAYGBgZ8csQ6hFh9hNQN+TxAVDFa4iTFiI8/CkYyAAAbZ6ILH/uOGgAAAABJRU5ErkJggg==',
    shadow_beast: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAABgUlEQVR4nO2WLXLDMBCFN52aiJQYK7ShwrpBAop9iBymhwgucG5gLJrSGJuEmBi4ICN3rZGs1Y+b6bSPSbOS3u63sgXwr18oyar60R60NiHBpvGmPx14IUY81w4qaM9UPVEDKeYBAGxzoQoh7K3WW3mcDHV9dy5ZuQcAULdmcV0MiRjCi4dg81ja/PWiAABguxPWcUgSVMLmvs/UA2zSRl1jilyE+eBuRV6IUSdBvgMh4sXrmRJnEjbb83pRE1VzrOnMEsAYeSFGV5+LF+k1T01iSdudmFE1xwAoAW1esqrGvadujffCYrXD5x7g3sPRzj3CxZldMsmqWhuIle5NyaraTALP6SK5aLqKhs03/ekwI5CrapimbS4n4alaZkCsfARy7z+1kA1v7OY26f1T/9TtoDa44M4DQw/ymf+OW4kAFv4+Uz6lH92794+7FmHvjyzX6xLfh5g9XWtITwnbYgEyupdzEl7lKRGiVMJJj7lcSiFsTYByKSkxP6GHt9Cf1xeSNwOo6oJCQQAAAABJRU5ErkJggg==',
    stone_golem: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAABPElEQVR4nGNgGAWjYEQDRlIUL5jW858YdQlZJSSZO5D2M5HvnOEBRnwAsJCi+MaNGxD61l0GBgYGBg01Zax8WgFa2E9SANAKpATYYM3bczYcoUpZgs98sgIAPaRpHfO0tH/ElwGMDAy4k4iNWwAKH5YHCQENDQ0U/pFdG7CqgyXxgbSfpCyAbjC9AS3sJysLbNi0ldruGDD78aYAmEXYChlikiOsehLhIMdp9LGfqoUgzMKBAuTYPyjaASJymHn7zSPiCjxK7GBgODJ4q8E3P1jpYtagDQB6ARYGhoFNggMNcKYAeiXBgQaDohDsmDQHo9MT4OFI1OAHJXYwMJBZBtC784NL+6laCA7FgCG6v12Rl4KRJGHJCp8ctQCt7B/x1eBoAAy0AwYajAbAQDtgoMFoAAy0AwYajPgAAAB2Yne4xPuIEwAAAABJRU5ErkJggg==',
    frost_giant: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABQCAYAAADRAH3kAAACOUlEQVR4nO2boVrCYBSGf3y0aJBqN+AdGChmCJotBi6By+ASDBazBMgWgncAwW6FgMUw03ToA8+2/4zt8H5vHIP9+55352xwCMGA92WSWG7zisccjuo4qGgOEgCOBIATLUDau7I9LGabV7zmoAoA57jqA0zma/dXtwVNzaFl+WFFTrJ/dWZ67CbhKQezFlDU8KZeEbF4y8FEgLInUffJW+Mxh2gBYhd/KBJ4zSFKAKtFe5fAcw56SHIT+g40a+vD3f3Ga08vz1vft2vfuu+Iy+A9B1UAOBIAjkkLsMJ7C7BCLUDsDQkARwLAieo1k/k66VycRi9i8fHpsv+neM5BFQBOtG0WUyyX7Zbbqz/Faw6qAHAkAJzcI2G3o8lGiet2u2aLGL0tkxBCmM1mG9vHw37jWsOh5RA9EzherP5t65yfbN1/sfqKPWQj8ZpDJUOhTTm5uvGQw48Aeb7Tfpy+VruaDIPeTRj0dq+pimdmWg66CYQjAeBIADgSAI4EgCMB4EgAOBIAjgSAIwHgSAA4EgCOBIAjAeBIADitEH5HkfKQjitZjkLFfPbwum02E0DMQRUAjgSAIwHgSAA4EgCOBIAjAeBIADi5vzyo8j9xKfT/BqbsMwdVADgSAI4EgFO6t+T54ST7A0XR/b3gPQdVADgSAI4EgCMB4EgAOBIAjgSAIwHgSAA4EgCOBIAjAeBIADgSAI4EgCMB4EgAOKUnT/5Ox24jnWgtur8XvOegCgBHAsCRAHAkAJxv3UZO04plyykAAAAASUVORK5CYII=',
    shadow_lord: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAYAAADS1n9/AAADxUlEQVR4nO2aIXsbMQyGtT0LaUFIychIcAdGigKKS7r/0NCW9ieUdjT7DxsZDhgKCVhxyMhIScFCAjrQqc/FsX32RZIt2y9pk0vi++RPOtl3AI1Go9GolDcpBn0/On12HfuzfUhyTpLkpF90MJ9wkxKNkKN+kUFihJuUYISc9b/l/HGAw8RTfD81uet/x/njPh636733TkaTBGeShlz0s1YAm3sft+sd8RfjK+cx3+9oQIN+tuuL7aS/nf6a4f/T1fH8YnwFP56+Av79+env6/HPDx/n5vc19QNa9LP3AEhXPADsiLW9Nj+vnVz1ixjAJuZufTO/ndzPAABuJ/ezu/XNnuNLMUHO+sUqQCNPRAwwXR3vuBvdj+9PV8dzWxaY39NKzvrFKoApJva1dlCPOfnd410TSOln7aq7nTAub7DjddE93l0Xa1oBIBr0s1aA7knHbnJon3yAff19kw8Ar8tCKf2iTWBMAErj7OgclptF0GeXmwWcHZ0zn9EL7AYw3Xsymjirge2Y1uxHctcvFtzL8fVzaAYAvGTM96cvqicfidWOSMRA5BIwJADLzQIux9cq7wFoItndwA+WMvjbciNEOy7zh+jHJOCsAuwVwBYAm3jb+9qrQMzku97njkHbCq4cVgMMbX66aK0CFNoRzhiIVwBX+Qs9rgHf5A/Vz2UCNgNoyYDaaT0AMZTGN+FIBBYDcAShVQEeRCtA6PVdax/QZ3wK/dSJQG4AbSWQCk7dJpRxIDWARBByNoFGWhNIgGT2I1SJQGYAqutfyOc1VgFK/ZS0CnAgKbIfoUiEwXeZzIH7gjDE0X13B82nZiSfHyhF/6AKYHOd7xGmoeXM9z3beFKXhZL0RxvAN4jUc2y+cbhNUJr+1gNUTjNA5bAb4NDljNZtYSR3/dEG8HWakluhLlI+SZyD/ljIKkCKnTBpcM1vGzsH/XhuMY3goGwJ3fygLF8hTwxzPkc/ZMNHWn+X0FgMWgam2vnqQ+MWcWraKiCAnE3vIjQZogygIRCtCsTBVgGoly+ploNDTZ+D/pBkCDaAhuxHqKqAJs0u+mLReoDKCTKAxkw4tApo1OzCFwuWCsB1vZbqAw6d/Bz1u0zQawDNmdBWBP14DaB58pFYE5Sg2YUtFuSXAO4ynfvdQW36nQYoKRNCq0BJml2YsWjLwP/UMPlI1wRWA5QYjNYQ2iGtAFLXZ+pxqAyvST8mxJ4BSsx+xFYFStbbx3KzaD1A7ewYoIZs6FaBGvT2QVYBpNfnue0HaNX/aoCasgGrQC16ffwDsujTbb3h0yoAAAAASUVORK5CYII=',
    rune_guardian: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABQCAYAAADRAH3kAAACfklEQVR4nO3doVbjQBTG8csenqMGUxODAbsGXVMEJvsEReAReMT2CcAgtiYag12FqcGs4SHWFsEp57QntNPMnWSS7/+TJWnnlu/MTCaTUzMAAADIOYo5+e+f2cqrIWvnl/OoNrVpCPX/aPPDkB8CII4AiDuOOfnt7d2rHb00hPqjArD2uvwX/R6nxYlDS7rR5/pdAmBm9vtmWfv69X1x0DF91df6mQOIIwDi3IaAkG5sCF39d/paPz2AOAIgzmUI6PMlnIc+108PII4AiCMA4giAuNrNB7NpsXOjw9X0p5mluRkyHo/MzOxp8bLzuPlimWzjhFL9UVcB68aqGkL9DAHikgfg7P889UcgQqMh4GnxErz4cTY6fKz0uL+eUl795aiyx/fJ3nNDjmuz/ugeoLyoOj0fcTZ6gIe7yd5tzm2mc1cv81CcrMzMft1WblcDOdRfXlT2uvy8a9hG/UwCxbntB1ir69LL8eZrj88T749FQ+4B2P7nhk6O0A2GAHG1PUBdN95lt51be4akNgC5fbm5tWdIGALEuU8C+64cVd/+LXSlL/SY2PfzmFwTgC2xX+q+8w+9Kkp9BcUQII4AiCMA4giAOO4FiHNfCUxxL4CVwHRYCRTHHEAcC0FbWAkUp7YS+BWA2bRY5bYbN6Q9s2mx8nhKRrV+5gDiCEBm2r7iiQ5AbIO5xOsWPYCT0Mlabhtkkwcgt4KxiR5AHAEQRwDENV5ACHmQ0mzz4cUm5+RqKPXTA4gjAOIIgDgCII4AiPsAxxvo4KZmj9QAAAAASUVORK5CYII=',
    village_npc_1: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAABSklEQVR4nO2YsRHCMAxFA8cIjJCCmoqCEVJkCI+QghEoMoKHSJERKKioKTICO0CVIsbEss6+b2O90ueYf/9HjkRVFc6GuvHc3t8+B9+GE/lsJDu0ACqxAtjy5PwPzjfA13nzudRLIfkSiB1A8SUgBqAFoCneAOclOF8i09h7XUZ10yV9+88k/xWIHUDxJcAyoG460loOsAyYxp60FouQAWRZAiEDyNKAkIgBaAFoxADKpkt78B5JOc8gIHeCWuuYOlbhBnAdns5u0LrB1nb6GqCU+lrjzgfct4liQJKzQKgAlKoW59gCkEsQLQCNGIAWgEYMQAtAIwagBaARA9AC0BRvgHUWMHtmzjCitSYNI2hIAmNOY+jflxKgbJqdbI/7RRLD47W6ngNJ/h9gEjOA4ktADEALQCMGoAWgEQPQAtB49QG/vq85NT4mHxf3c4sQLEc0AAAAAElFTkSuQmCC',
    village_npc_2: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAABSklEQVR4nO2YsRWCMBCG0ecIjkBBbe0IFIxgkREoHMGCEVI4AgUjWFtTMII7aEVBjHC5l7w/MfeVeSH+7/+5cGdRZM6OurG6n98uB4+XB/lsJAe0ACqhAtjz5PwPm2+Aq/Pmc7GXQvQlEDqA7EtADEALQJO9AZuX4HyJTEPndBmVdRv17T8T/VcgdADZlwDLgLJuSWspwDJgGjrSWih8BpBkCfgMIEkDfCIGoAWgEQMom65N5TyScp5BQO4EtdYhdazCDeDWj5vdoHWDre10NUAp9bXGnQ+4bxPFgChnAV8BKFUszrEFIJcgWgAaMQAtAI0YgBaARgxAC0AjBqAFoMneAOssYPbMnGFEa00aRtCQBIacxtC/LyVA2TQ72ZyOiyT652t1PQWi/D/AJGQA2ZeAGIAWgEYMQAtAIwagBaBx6gN+fV9TanxMPjD7c4vP5eBUAAAAAElFTkSuQmCC',
    village_npc_3: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAABSElEQVR4nO2YsRWCMBCG0ecIjkBhncohKBgiI1A4ggUjZAgKhrCitmAEd9CKghjhci95f2LuK/NC/N//c+HOqiqcA3XjQ6m3z8HXaSKfjeSEFkAlVgBHnpz/YfcN8HXefi71Uki+BGIHUHwJiAFoAWiKN2D3ElwukXnsvS6juumSvv0Xkv8KxA6g+BJgGVA3HWktB1gGzGNPWotFyACyLIGQAWRpQEjEALQANGIAZdOtvXiPpJxnEJA7QWNMTB2bcAO4D8/dbtC5wdV2+hqgtf5a484H3LeJYkCSs0CoALSuVue4ApBLEC0AjRiAFoBGDEALQCMGoAWgEQPQAtAUb4BzFrB7Zs4wYowhDSNoSAJjTmPo35cSoGxanGzVeZXEML0213Mgyf8DbGIGUHwJiAFoAWjEALQANGIAWgAarz7g1/c1p8bH5gMkeXOLUqHDywAAAABJRU5ErkJggg==',
    shopkeeper: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAABZklEQVR4nO2XoZnDMAyFlftuhI4QcLgo+HBARyjwCAEdoSAjGNwIBRmiqLggI3SHFhU0tVNZn51nX/RDx7GV96RYJlIURVGU1VJxJt3PdBct3vDWR/KNDoBDSgO+JAv/J1gZUDVUjUMf5ELddtmnP1EhJZDSgNWXgEiAuu1YYyUgEmAcetZYKmIaECzA3EZLZUFMA4J/guPQez90iSyo2867z9wzH6JTYMl0d+0d04AijsEpMQ3QY5Az6bD7Ce7FJe8gYJeAtTZlHLNIDTierh+7QecEV9sZKoAx5m1Mej+QZhNHgCx/grEMMOb1Gu0yIEiAw9+ZNe+4b0KWhZJlBvhIYYAeg+gA0KgA6ADQqADoANCoAOgA0KxeAGcnOO2ZJZcRay3rMoImy1Z4SQO0BDiTnkpef+sXJ06XW0VEtNtunOMlkGUJTElpwOpLQAVAB4BGBUAHgEYFQAeAJqgP8J2vJTU+Ux4bmn493DqAhgAAAABJRU5ErkJggg==',
    collectible: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAvUlEQVR4nGNgGAzg//9p////n/Z/IOxmgTEYGbMYkSX+P0upQOYzSs3pIMVgYvUzoguga8TQQMAhePVLGrUzMKB6lgVZHkXzo3PtKJrljCphanA5ghj9DM/PVSILM2F16aNz7QzmKZhixAJc+tEsR3EA3PXImnE4Alswk6sfewicnINKkwpI0I/dAZRYTqJ+3A6gE4A7AJ6yYakVG4DKYcsF5OrHHgLYDMFnMAX66VsQYdGP4QBcBtGqKB4FAOE7b4tfCJnGAAAAAElFTkSuQmCC',
    gold_coin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAYUlEQVR4nGNgoAbY0iPyn4GBgeH/CaP//08Y/SdVnoGBgYHh//9p/2EKsCmCy0HVwcSZYJLYNGBjo4sxwUVOzsHnSwRAU8fEwMDAwGhxjhFdHbIYIXkUZ8GcBgs4UuTJAgAvE0zTgKjhUAAAAABJRU5ErkJggg==',
    target: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAtUlEQVR4nM2VwQ3EIAwEc64hJdyDEuj/RQl5pIT0kHsRLRsnNlhI5xdYO2YNApZlYuwpnZbm44W/2/aojfC3pOXaMtLLNxOE11Ia8MjZNDHCiwfmnNblKC9vwiPnxrlWOMoLOmJYG1cNdhHhbzuAwFrKBWARDO04vPye0qka6Ine68msagBdYzfe6OGlOqkAF+Fx1WDnEf4qYl0jXoC3fpQXTrDQs3iE/6+n+K3QrM9oani+4x9g2LBtfwUl8QAAAABJRU5ErkJggg==',
    lost_child: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAAA8UlEQVR4nGNgGGDAiC6QYiP3n5CmOUceYegjF7BQyyAYINUDTNR2AKlg1AEYaWDOkUeMd7b0/FfxKWG4s6UHLg7jq/iUUC0BMjBgyQUMDAwMd7b04ExIxDiAFA/QLAqQLcfGp7kDiAUYDrBJOYE3HxOSJxXA4wM53hM22ODUsCDgCJyNLT3YpJz4j6wGHSRssGE4MscCro9qJSHCA0cIeyAAolbFp4Rx8KWBUQfQG8ATISxFE8pm6KmYUoA1GxHShM8BpOrHyIZH5lgwBhiJwA3ZcO4NBp+QBaQAqreISPXAgCfCAXcA1ihADyZqxzsyAABdCmla5dhFEAAAAABJRU5ErkJggg==',
    tree: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAn0lEQVR4nK2TzQ2AIAyFn8YTXokDOAAbuYcjuIcbOQADGK5y1VNNgZaQ6Lv1530BWoCP6rTCvM43j/3mxd4imRtz5aAk4ObRjonxCpcI6WtmYw2MNQWQ974AyUySIAmAiJJZg5CnOAGX20+4/ay1yIAYYlMOAAaNHEPEsUxVM8DGmL+DJhonjbK4Ap93S+0F8OWQGrVF+neVayDtM33WAwnxRu6+sV/rAAAAAElFTkSuQmCC',
    house: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqElEQVR4nGNgGOmAEcZIMeL6T0+L55z7xsjAwMDAgiyoLsxJF8tvvv0OZ7OgS4ryStHU8tefn6HwmWhqGxFg1AGjDhh1wKgDMEpC9JKK7g6QF2CjqYUPP/xC4Q++KHjzjZfGVr5F4Q14CIw6YNQBA+4AjGxIDFh2+QlW8ShdGZLNGvAQGB4O6FmlQbZejDTw9ddbbOrwgpKwG2TrRXEAco+FHECp/pEJALqvJBqR4bsaAAAAAElFTkSuQmCC',
    well: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoElEQVR4nK2TQRGEMAxFCxoiAhERsWIiI2IQERGIiAf29DtpSAdm2X9qU95rpi2tvcwyW1DVM85FpPz2UgRIREPd3UvRMFHVM4M57j5I+iDDZjaAzFxK1moXwLtR241KIbLm3SOMZAkR9bMqOwBAG19qZQez+FG3fSv4sD+qdYGILLhnnHYEMMba7S1ESYZz/veQoqS1H59yJUJmP9PrfAHZPV0WswjjaQAAAABJRU5ErkJggg==',
    sword_pickup: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAgCAYAAAAbifjMAAAAlElEQVR4nGNgGNTgv8v///9d/v/Hp4YJp+Zp/wOwsYkyAK6hALuBRLlg66St67GxiTaAWIBhAD7/YpOjvgtGDaCCAYxZjBtwKcYmNwi9wMCA5NQJWMSo7QJGZM7/Mwz/GQSM8Ov4cI6B0QShj2IXsGCzgWrg/xmG/ycWMJBXJhILRg1AS0jI4P8Z1NBHTjxUdcHAAwDYpDHEZfeBfwAAAABJRU5ErkJggg==',
    sword_slash: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArElEQVR4nO2TwQ3CMAxF/Vml2QEGYghG6BAMBDu0s3wujWRS2yGVONXv0kOdvOdKFTk7GD3wWviI3t8K5r8E9MRHQ7oBlvg6yd2afa/yHA0JA7Tck3romCjCDejIJ+fYOhphBgRyT+yG9CJ2AZYcQCHJH+WynQHJpRdx8S6w5ABQnxZ6hiQBFH2XxVdA9KttG7EKjs60DvcLACh1g3a7iHZW35MkSZIkSZIkFh+Gzk3aLac5SQAAAABJRU5ErkJggg=='
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    create() {
        this.add.text(400, 225, 'Mob Slayer モブスレイヤー', {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', {
            fontSize: '20px', fill: '#aaa'
        }).setOrigin(0.5);

        const keys = Object.keys(SPRITE_DATA);
        let loaded = 0;

        keys.forEach(key => {
            this.textures.once('addtexture-' + key, () => {
                loaded++;
                if (loaded === keys.length) this.onSpritesLoaded();
            });
            this.textures.addBase64(key, SPRITE_DATA[key]);
        });
    }

    onSpritesLoaded() {
        // Player: 8 frames of 32x32 (down x2, left x2, right x2, up x2)
        for (let i = 0; i < 8; i++) {
            this.textures.get('player').add(i, 0, i * 32, 0, 32, 32);
        }

        this.anims.create({
            key: 'player_idle_down',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1, repeat: -1
        });
        this.anims.create({
            key: 'player_walk_down',
            frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
            frameRate: 8, repeat: -1
        });
        this.anims.create({
            key: 'player_idle_left',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 1, repeat: -1
        });
        this.anims.create({
            key: 'player_walk_left',
            frames: [{ key: 'player', frame: 2 }, { key: 'player', frame: 3 }],
            frameRate: 8, repeat: -1
        });
        this.anims.create({
            key: 'player_idle_right',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 1, repeat: -1
        });
        this.anims.create({
            key: 'player_walk_right',
            frames: [{ key: 'player', frame: 4 }, { key: 'player', frame: 5 }],
            frameRate: 8, repeat: -1
        });
        this.anims.create({
            key: 'player_idle_up',
            frames: [{ key: 'player', frame: 6 }],
            frameRate: 1, repeat: -1
        });
        this.anims.create({
            key: 'player_walk_up',
            frames: [{ key: 'player', frame: 6 }, { key: 'player', frame: 7 }],
            frameRate: 8, repeat: -1
        });

        // Player Slayer: 8 frames of 32x32 (same layout, purple sword)
        for (let i = 0; i < 8; i++) {
            this.textures.get('player_slayer').add(i, 0, i * 32, 0, 32, 32);
        }
        ['down', 'left', 'right', 'up'].forEach((dir, idx) => {
            this.anims.create({
                key: 'slayer_idle_' + dir,
                frames: [{ key: 'player_slayer', frame: idx * 2 }],
                frameRate: 1, repeat: -1
            });
            this.anims.create({
                key: 'slayer_walk_' + dir,
                frames: [{ key: 'player_slayer', frame: idx * 2 }, { key: 'player_slayer', frame: idx * 2 + 1 }],
                frameRate: 8, repeat: -1
            });
        });

        // Goblin: 2 frames of 24x24
        this.textures.get('goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('goblin').add(1, 0, 24, 0, 24, 24);

        this.anims.create({
            key: 'goblin_idle',
            frames: [{ key: 'goblin', frame: 0 }, { key: 'goblin', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        // Blacksmith: 2 frames of 32x48
        this.textures.get('blacksmith').add(0, 0, 0, 0, 32, 48);
        this.textures.get('blacksmith').add(1, 0, 32, 0, 32, 48);

        this.anims.create({
            key: 'blacksmith_idle',
            frames: [{ key: 'blacksmith', frame: 0 }, { key: 'blacksmith', frame: 1 }],
            frameRate: 2,
            repeat: -1
        });

        // Night Goblin: 2 frames of 24x24
        this.textures.get('night_goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('night_goblin').add(1, 0, 24, 0, 24, 24);

        this.anims.create({
            key: 'night_goblin_idle',
            frames: [{ key: 'night_goblin', frame: 0 }, { key: 'night_goblin', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        // Troll: 2 frames of 64x80
        this.textures.get('troll').add(0, 0, 0, 0, 64, 80);
        this.textures.get('troll').add(1, 0, 64, 0, 64, 80);
        this.anims.create({
            key: 'troll_idle',
            frames: [{ key: 'troll', frame: 0 }, { key: 'troll', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Ice Wolf: 2 frames of 24x24
        this.textures.get('ice_wolf').add(0, 0, 0, 0, 24, 24);
        this.textures.get('ice_wolf').add(1, 0, 24, 0, 24, 24);
        this.anims.create({
            key: 'ice_wolf_idle',
            frames: [{ key: 'ice_wolf', frame: 0 }, { key: 'ice_wolf', frame: 1 }],
            frameRate: 4, repeat: -1
        });

        // Shadow Beast: 2 frames of 24x24
        this.textures.get('shadow_beast').add(0, 0, 0, 0, 24, 24);
        this.textures.get('shadow_beast').add(1, 0, 24, 0, 24, 24);
        this.anims.create({
            key: 'shadow_beast_idle',
            frames: [{ key: 'shadow_beast', frame: 0 }, { key: 'shadow_beast', frame: 1 }],
            frameRate: 5, repeat: -1
        });

        // Stone Golem: 2 frames of 32x32
        this.textures.get('stone_golem').add(0, 0, 0, 0, 32, 32);
        this.textures.get('stone_golem').add(1, 0, 32, 0, 32, 32);
        this.anims.create({
            key: 'stone_golem_idle',
            frames: [{ key: 'stone_golem', frame: 0 }, { key: 'stone_golem', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Frost Giant: 2 frames of 64x80
        this.textures.get('frost_giant').add(0, 0, 0, 0, 64, 80);
        this.textures.get('frost_giant').add(1, 0, 64, 0, 64, 80);
        this.anims.create({
            key: 'frost_giant_idle',
            frames: [{ key: 'frost_giant', frame: 0 }, { key: 'frost_giant', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Shadow Lord: 2 frames of 64x64
        this.textures.get('shadow_lord').add(0, 0, 0, 0, 64, 64);
        this.textures.get('shadow_lord').add(1, 0, 64, 0, 64, 64);
        this.anims.create({
            key: 'shadow_lord_idle',
            frames: [{ key: 'shadow_lord', frame: 0 }, { key: 'shadow_lord', frame: 1 }],
            frameRate: 3, repeat: -1
        });

        // Rune Guardian: 2 frames of 64x80
        this.textures.get('rune_guardian').add(0, 0, 0, 0, 64, 80);
        this.textures.get('rune_guardian').add(1, 0, 64, 0, 64, 80);
        this.anims.create({
            key: 'rune_guardian_idle',
            frames: [{ key: 'rune_guardian', frame: 0 }, { key: 'rune_guardian', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Village NPC 1: 2 frames of 32x48
        this.textures.get('village_npc_1').add(0, 0, 0, 0, 32, 48);
        this.textures.get('village_npc_1').add(1, 0, 32, 0, 32, 48);
        this.anims.create({
            key: 'village_npc_1_idle',
            frames: [{ key: 'village_npc_1', frame: 0 }, { key: 'village_npc_1', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Village NPC 2: 2 frames of 32x48
        this.textures.get('village_npc_2').add(0, 0, 0, 0, 32, 48);
        this.textures.get('village_npc_2').add(1, 0, 32, 0, 32, 48);
        this.anims.create({
            key: 'village_npc_2_idle',
            frames: [{ key: 'village_npc_2', frame: 0 }, { key: 'village_npc_2', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Village NPC 3: 2 frames of 32x48
        this.textures.get('village_npc_3').add(0, 0, 0, 0, 32, 48);
        this.textures.get('village_npc_3').add(1, 0, 32, 0, 32, 48);
        this.anims.create({
            key: 'village_npc_3_idle',
            frames: [{ key: 'village_npc_3', frame: 0 }, { key: 'village_npc_3', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Shopkeeper: 2 frames of 32x48
        this.textures.get('shopkeeper').add(0, 0, 0, 0, 32, 48);
        this.textures.get('shopkeeper').add(1, 0, 32, 0, 32, 48);
        this.anims.create({
            key: 'shopkeeper_idle',
            frames: [{ key: 'shopkeeper', frame: 0 }, { key: 'shopkeeper', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Collectible: 2 frames of 16x16
        this.textures.get('collectible').add(0, 0, 0, 0, 16, 16);
        this.textures.get('collectible').add(1, 0, 16, 0, 16, 16);
        this.anims.create({
            key: 'collectible_idle',
            frames: [{ key: 'collectible', frame: 0 }, { key: 'collectible', frame: 1 }],
            frameRate: 3, repeat: -1
        });

        // Gold Coin: 2 frames of 8x8
        this.textures.get('gold_coin').add(0, 0, 0, 0, 8, 8);
        this.textures.get('gold_coin').add(1, 0, 8, 0, 8, 8);
        this.anims.create({
            key: 'gold_coin_idle',
            frames: [{ key: 'gold_coin', frame: 0 }, { key: 'gold_coin', frame: 1 }],
            frameRate: 4, repeat: -1
        });

        // Target: 2 frames of 16x16
        this.textures.get('target').add(0, 0, 0, 0, 16, 16);
        this.textures.get('target').add(1, 0, 16, 0, 16, 16);
        this.anims.create({
            key: 'target_idle',
            frames: [{ key: 'target', frame: 0 }, { key: 'target', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Lost Child: 2 frames of 16x24
        this.textures.get('lost_child').add(0, 0, 0, 0, 16, 24);
        this.textures.get('lost_child').add(1, 0, 16, 0, 16, 24);
        this.anims.create({
            key: 'lost_child_idle',
            frames: [{ key: 'lost_child', frame: 0 }, { key: 'lost_child', frame: 1 }],
            frameRate: 2, repeat: -1
        });

        // Tree: 1 frame of 16x16 (static)
        this.textures.get('tree').add(0, 0, 0, 0, 16, 16);

        // House: 1 frame of 32x32 (static)
        this.textures.get('house').add(0, 0, 0, 0, 32, 32);

        // Well: 1 frame of 16x16 (static)
        this.textures.get('well').add(0, 0, 0, 0, 16, 16);

        // Sword Pickup: 1 frame of 16x32
        this.textures.get('sword_pickup').add(0, 0, 0, 0, 16, 32);

        // Sword Slash: 1 frame of 32x32
        this.textures.get('sword_slash').add(0, 0, 0, 0, 32, 32);

        this.scene.start('Village');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [
        BootScene,
        VillageScene, WoodsDayScene, WoodsNightScene,
        BossArenaScene, VictoryScene,
        TundraVillageScene, FrozenLakeScene, SnowCaveScene, BlizzardPassScene,
        TundraTargetPracticeScene,
        TundraScene, IceFortressScene, FrostGiantArenaScene,
        ForestVillageScene, MushroomGroveScene, CursedSwampScene, HollowTreeScene,
        ForestObstacleCourseScene,
        DarkForestScene, ShadowKeepScene, ShadowLordArenaScene,
        RuinsVillageScene, CrumblingBridgeScene, BuriedLibraryScene, LavaPitScene,
        RuinsMemoryPuzzleScene,
        RuinsScene, ShatteredTempleScene, RuneGuardianArenaScene,
        FinalVictoryScene
    ]
};

const game = new Phaser.Game(config);
