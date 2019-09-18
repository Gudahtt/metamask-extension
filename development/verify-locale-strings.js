// //////////////////////////////////////////////////////////////////////////////
//
// Locale verification script
//
// usage:
//
//     node app/scripts/verify-locale-strings.js <locale>
//
// will check the given locale against the strings in english
//
// //////////////////////////////////////////////////////////////////////////////

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const localeIndex = require('../app/_locales/index.json')
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

console.log('Locale Verification')

const specifiedLocale = process.argv[2]
if (specifiedLocale) {
  console.log(`Verifying selected locale "${specifiedLocale}":\n\n`)
  const locale = localeIndex.find(localeMeta => localeMeta.code === specifiedLocale)
  verifyLocale(locale)
} else {
  console.log('Verifying all locales:\n\n')
  localeIndex.forEach(localeMeta => {
    verifyLocale(localeMeta)
    console.log('\n')
  })
}


function verifyLocale ({ code, name }) {
  let englishLocale
  try {
    const englishFilePath = path.join(process.cwd(), 'app', '_locales', 'en', 'messages.json')
    englishLocale = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'))
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('English File not found')
    } else {
      console.log('Error opening english locale file: ', e)
    }
    process.exit(1)
  }

  if (code === 'en') {
    return verifyEnglishLocale(englishLocale)
  }

  let targetLocale
  try {
    const localeFilePath = path.join(process.cwd(), 'app', '_locales', code, 'messages.json')
    targetLocale = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'))
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('Locale file not found')
    } else {
      console.log(`Error opening your locale ("${code}") file: `, e)
    }
    process.exit(1)
  }

  // console.log('  verifying whether all your locale ("${code}") strings are contained in the english one')
  const extraItems = compareLocalesForMissingItems({ base: targetLocale, subject: englishLocale })
  // console.log('\n  verifying whether your locale ("${code}") contains all english strings')
  const missingItems = compareLocalesForMissingItems({ base: englishLocale, subject: targetLocale })

  const englishEntryCount = Object.keys(englishLocale).length
  const coveragePercent = 100 * (englishEntryCount - missingItems.length) / englishEntryCount

  console.log(`Status of **${name} (${code})** ${coveragePercent.toFixed(2)}% coverage:`)

  if (extraItems.length) {
    console.log('\nExtra items that should not be localized:')
    extraItems.forEach(function (key) {
      console.log(`  - [ ] ${key}`)
    })
  } else {
    // console.log(`  all ${counter} strings declared in your locale ("${code}") were found in the english one`)
  }

  if (missingItems.length) {
    console.log(`\nMissing items not present in localized file:`)
    missingItems.forEach(function (key) {
      console.log(`  - [ ] ${key}`)
    })
  } else {
    // console.log(`  all ${counter} english strings were found in your locale ("${code}")!`)
  }

  if (!extraItems.length && !missingItems.length) {
    console.log('Full coverage  : )')
  }

  if (extraItems.length > 0) {
    process.exit(1)
  }
}

async function verifyEnglishLocale (englishLocale) {
  const javascriptFiles = await findJavascriptFiles(path.resolve(__dirname, '..', 'ui'))

  let remainingKeys = Object.keys(englishLocale)
  for await (const fileContents of getFileContents(javascriptFiles)) {
    remainingKeys = remainingKeys
      .filter(key => !fileContents.includes(`t('${key}'`))
    if (remainingKeys.length === 0) {
      break
    }
  }

  console.log(`Status of **English (en)** ${remainingKeys.length} unused messages:`)

  if (remainingKeys.length === 0) {
    console.log('Full coverage  : )')
    process.exit(0)
  }

  console.log(`\nMessages not present in UI:`)
  remainingKeys.forEach(function (key) {
    console.log(`  - [ ] ${key}`)
  })
  process.exit(1)
}

async function findJavascriptFiles (rootDir) {
  const javascriptFiles = []
  const contents = await readdir(rootDir, { withFileTypes: true })
  for (const file of contents) {
    if (file.isDirectory()) {
      javascriptFiles.push(...(await findJavascriptFiles(path.join(rootDir, file.name))))
    } else if (file.isFile() && file.name.endsWith('.js')) {
      javascriptFiles.push(path.join(rootDir, file.name))
    }
  }
  return javascriptFiles
}

async function * getFileContents (filenames) {
  for (const filename of filenames) {
    yield readFile(filename, 'utf8')
  }
}


function compareLocalesForMissingItems ({ base, subject }) {
  return Object.keys(base).filter((key) => !subject[key])
}
