import fs from "fs";
import path from "path";

// função auxiliar
const createFile = (filePath, content = "") => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("✅ Criado:", filePath);
};

// diretórios base
const backendDir = "./backend-barbearia";
const frontendDir = "./frontend-barbearia";

// === BACKEND ===
createFile(`${backendDir}/package.json`, `
{
  "name": "backend-barbearia",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.9.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
`);

createFile(`${backendDir}/server.js`, `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log("🚀 Servidor rodando na porta " + PORT));
`);

createFile(`${backendDir}/config/db.js`, `
import mysql from "mysql2";

export const connectDB = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "barbearia_db"
  });

  connection.connect(err => {
    if (err) throw err;
    console.log("🟢 MySQL conectado com sucesso!");
  });

  global.db = connection;
};
`);

createFile(`${backendDir}/routes/auth.routes.js`, `
import express from "express";
import { login } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/login", login);

export default router;
`);

createFile(`${backendDir}/controllers/auth.controller.js`, `
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const login = (req, res) => {
  const { email, senha } = req.body;
  if (email === "admin@barbearia.com" && senha === "1234") {
    const token = jwt.sign({ id: 1, tipo_usuario: "ADM" }, process.env.JWT_SECRET || "segredo", { expiresIn: "8h" });
    return res.json({ token, tipo_usuario: "ADM" });
  }
  return res.status(401).json({ message: "Credenciais inválidas" });
};
`);

createFile(`${backendDir}/.env`, `
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=barbearia_db
JWT_SECRET=segredo_super
`);


// === FRONTEND ===
createFile(`${frontendDir}/angular.json`, `
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "projects": {
    "frontend-barbearia": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app"
    }
  }
}
`);

createFile(`${frontendDir}/src/environments/environment.ts`, `
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
`);

createFile(`${frontendDir}/src/app/app-routing.module.ts`, `
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
`);

createFile(`${frontendDir}/src/app/app.module.ts`, `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/auth/login/login.component';

@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
`);

createFile(`${frontendDir}/src/app/app.component.ts`, `
import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {}
`);

createFile(`${frontendDir}/src/app/modules/auth/login/login.component.ts`, `
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  constructor(private auth: AuthService) {}
  login() {
    this.auth.login(this.email, this.senha).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        alert('Login bem-sucedido como ' + res.tipo_usuario);
      },
      error: err => alert('Erro no login: ' + err.error.message)
    });
  }
}
`);

createFile(`${frontendDir}/src/app/modules/auth/login/login.component.html`, `
<div style="max-width:400px;margin:100px auto;text-align:center;">
  <h2>Login - Sistema Barbearia</h2>
  <input [(ngModel)]="email" placeholder="Email" /><br><br>
  <input [(ngModel)]="senha" placeholder="Senha" type="password"/><br><br>
  <button (click)="login()">Entrar</button>
</div>
`);

createFile(`${frontendDir}/src/app/services/auth.service.ts`, `
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  constructor(private http: HttpClient) {}
  login(email: string, senha: string) {
    return this.http.post(this.apiUrl + '/login', { email, senha });
  }
}
`);


