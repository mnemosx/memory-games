import React, { useState, Fragment, useEffect, useRef } from 'react'
import update from 'immutability-helper'
import { normalizeText } from 'normalize-text'
import { shuffleArray } from '../../utils'
import { Error } from '../Error'
import { Loading } from '../Loading'
import { Card } from '../Card'

export default function Names() {
  // prettier-ignore
  const allNationalities = ['GB','US','CA','AU','BR','CH','DE','DK','ES','FI','FR','IE','IR','NO','NL','NZ','TR']
  const amountOptions = [5, 8, 12, 15, 20, 25, 30]
  const difficultyOptions = [
    { value: 'typeIn', label: "Type in persons' name" },
    { value: 'connect', label: "Connect persons' name with face" },
    { firstNamesOnly: false }
  ]

  const [error, setError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [stage, setStage] = useState('setup') // can be 'setup', 'memorize', 'recite', 'finish'
  const [items, setItems] = useState([])
  const [userInputs, setUserInputs] = useState(null)
  const [gameResults, setGameResults] = useState(null)
  const [selectedGameSettings, setSelectedGameSettings] = useState({
    selectedNationalities: ['GB', 'US', 'CA'],
    selectedAmountOfItemsToShow: amountOptions[0],
    selectedDifficulty: {
      type: difficultyOptions[0].value,
      firstNamesOnly: true
    }
  })

  const useWatch = useEffect
  const itemsRef = useRef(items)

  useWatch(() => {
    if (stage !== 'recite' || items === itemsRef.current) return
    itemsRef.current = items
    setItems(update(items, { $set: shuffleArray(items) }))
    setUserInputs(
      items.map(item => ({
        first: normalizeText(item.name.first),
        last: normalizeText(item.name.last),
        id: item.id,
        userAnswer: null
      }))
    )
  }, [stage])

  const onLangChanged = e => {
    const name = e.target.name

    let selected = selectedGameSettings.selectedNationalities
    let find = selected.indexOf(name)

    if (find > -1) {
      selected.splice(find, 1)
    } else {
      selected.push(name)
    }

    setSelectedGameSettings(prevState => ({
      ...prevState,
      selectedNationalities: selected
    }))
  }
  const onAmountChanged = e => {
    setSelectedGameSettings(prevState => ({
      ...prevState,
      selectedAmountOfItemsToShow: e.target.value
    }))
  }
  const onDifficultyChanged = (key, e) => {
    setSelectedGameSettings(prevState => ({
      ...prevState,
      selectedDifficulty: {
        ...prevState.selectedDifficulty,
        [key]: key === 'firstNamesOnly' ? e.target.checked : e.target.value
      }
    }))
  }

  const startGame = e => {
    e.preventDefault()
    // prettier-ignore
    const { selectedNationalities, selectedAmountOfItemsToShow } = selectedGameSettings
    const URL = `https://randomuser.me/api/?inc=picture,name&results=${selectedAmountOfItemsToShow}&nat=${selectedNationalities
      .toString()
      .toLowerCase()}&noinfo`
    // TODO: find better api with more people (or two separate apis - one for names and one for pictures)
    fetch(URL)
      .then(res => res.json())
      .then(
        result => {
          const results = result.results.map((item, idx) => ({
            ...item,
            id: idx
          }))
          setItems(results)
          setIsLoaded(true)
          setStage('memorize')
        },
        error => {
          setIsLoaded(true)
          setError(error)
        }
      )
  }

  const onAnswerInput = (e, id) => {
    const userInput = normalizeText(e.target.value)
    const currentPerson = userInputs.indexOf(
      userInputs.find(item => item.id === id)
    )
    const newUserInputs = update(userInputs, {
      [currentPerson]: { userAnswer: { $set: userInput } }
    })
    setUserInputs(newUserInputs)
  }

  const checkUserInputs = () => {
    let counter = 0
    userInputs &&
      userInputs.forEach(item => {
        if (selectedGameSettings.selectedDifficulty.firstNamesOnly) {
          if (item.first === item.userAnswer) counter++
          return
        }
        if (item.first + ' ' + item.last === item.userAnswer) counter++
      })
    setGameResults(counter)
    setStage('finish')
  }

  const PersonCard = item => {
    return (
      <Fragment key={item.name.first + item.name.last}>
        <Card
          src={item.picture.large}
          alt={item.name.first + '' + item.name.last}
        >
          {stage === 'recite' ? (
            <input
              className="input input-bordered bg-primary-content bg-opacity-60 text-neutral text-lg"
              type="text"
              onBlur={e => onAnswerInput(e, item.id)}
            />
          ) : (
            <p>
              {selectedGameSettings.selectedDifficulty.firstNamesOnly
                ? item.name.first
                : `${item.name.first} ${item.name.last}`}
            </p>
          )}
        </Card>
      </Fragment>
    )
  }

  return (
    <div className="flex flex-col mx-auto w-11/12 focus-visible:outline-none">
      <h2 className="text-3xl text-center font-bold mt-20 mb-10">Names</h2>
      {stage === 'setup' && (
        <form onSubmit={startGame}>
          {/* TODO: Switch to https://formik.org/ */}
          <h3>Choose settings for your game</h3>
          <fieldset>
            Nationalities:
            {allNationalities.map(lang => {
              return (
                <Fragment key={lang}>
                  <label>
                    <input
                      type="checkbox"
                      id={`lang-${lang}`}
                      name={lang}
                      checked={selectedGameSettings.selectedNationalities.includes(
                        lang
                      )}
                      onChange={onLangChanged}
                    />
                    {lang}
                  </label>
                </Fragment>
              )
            })}
          </fieldset>
          <fieldset>
            <label>
              Select how many people to display:
              <select
                value={selectedGameSettings.selectedAmountOfItemsToShow}
                onChange={onAmountChanged}
              >
                {amountOptions.map(option => {
                  return <option key={option}>{option}</option>
                })}
              </select>
            </label>
          </fieldset>
          <fieldset>
            Difficulty:
            {difficultyOptions.map(option => {
              return (
                option.value && (
                  <Fragment key={option.value}>
                    <label>
                      <input
                        type="radio"
                        id={option.value}
                        name={option.value}
                        value={option.value}
                        disabled={option.value === 'connect'} // TODO: temporarily. until option gets implemented
                        checked={
                          option.value ===
                          selectedGameSettings.selectedDifficulty.type
                        }
                        onChange={e => onDifficultyChanged('type', e)}
                      />
                      {option.label}
                    </label>
                  </Fragment>
                )
              )
            })}
            <label>
              <input
                type="checkbox"
                id="firstNamesOnly"
                name="firstNamesOnly"
                value="firstNamesOnly"
                checked={selectedGameSettings.selectedDifficulty.firstNamesOnly}
                onChange={e => onDifficultyChanged('firstNamesOnly', e)}
              />
              First Names Only
            </label>
          </fieldset>
          <div className="w-full mt-6 flex justify-center">
            <button className="btn btn-primary" type="submit">
              Start
            </button>
          </div>
        </form>
      )}
      {(stage === 'memorize' || stage === 'recite') && (
        <div className="flex justify-center flex-wrap gap-5 mb-5">
          {
            // prettier-ignore
            !!error ? <Error message={error} />
            : !isLoaded ? <Loading />
            : items.map(item => PersonCard(item))
          }
        </div>
      )}
      <div className="w-full mt-5 flex justify-center">
        {(() => {
          switch (stage) {
            case 'memorize':
              return (
                <button
                  className="btn btn-primary"
                  onClick={e => {
                    e.preventDefault()
                    setStage('recite')
                  }}
                >
                  Recite
                </button>
              )
            case 'recite':
              return (
                <button
                  className="btn btn-primary"
                  onClick={e => {
                    e.preventDefault()
                    setStage('finish')
                    checkUserInputs()
                  }}
                >
                  Finish
                </button>
              )
            case 'finish':
              const message =
                gameResults != null && gameResults > 0 ? (
                  // prettier-ignore
                  <div className="text-center mb-6">
                    Congrats, you got {gameResults} name{gameResults > 1 && 's'}{' '} right!
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    Sorry, you didn't get any names right.
                  </div>
                )
              const finish = (
                <div className="flex flex-col">
                  {message}
                  <button
                    className="btn btn-primary"
                    onClick={e => {
                      e.preventDefault()
                      setStage('setup')
                    }}
                  >
                    Restart
                  </button>
                </div>
              )
              return finish
            default:
              return <></>
          }
        })()}
      </div>
    </div>
  )
}
