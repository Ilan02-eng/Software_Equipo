import mysql from 'mysql2'
import express from 'express'

const app = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
})

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'Bosco7878..',
    database: "cat_cafe"
}).promise()

export async function getCats(){
    const [rows] = await pool.query("SELECT * FROM cats")
    return rows
}

async function getFood(){
    const [rows] = await pool.query("SELECT * FROM food")
    return rows
}

const DAY_NORMALIZE = {
    "monday":    "monday",    "lunes":      "monday",
    "tuesday":   "tuesday",   "martes":     "tuesday",
    "wednesday": "wednesday", "miércoles":  "wednesday", "miercoles": "wednesday",
    "thursday":  "thursday",  "jueves":     "thursday",
    "friday":    "friday",    "viernes":    "friday",
    "saturday":  "saturday",  "sábado":     "saturday",  "sabado": "saturday",
    "sunday":    "sunday",    "domingo":    "sunday",
}

app.get('/api/food', async (req, res) => {
    try {
        const food = await getFood()

        const grouped = { en: {}, es: {} }

        for (const item of food) {
            const lang   = item.Idioma === "Español" ? "es" : "en"
            const dayKey = DAY_NORMALIZE[item.WeekDay.toLowerCase()] || item.WeekDay.toLowerCase()

            if (!grouped[lang][dayKey]) grouped[lang][dayKey] = []

            grouped[lang][dayKey].push({
                name:    item.FoodName,
                price:   `$${item.Price}`,
                picture: item.Picture
            })
        }

        res.json(grouped)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener el menú' })
    }
})


app.get('/api/cats', async (req, res) => {
    try {
        const cats = await getCats()
        res.json(cats)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener los gatos' })
    }
})

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`))