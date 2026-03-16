/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/auth-service/src/auth-service.controller.ts":
/*!**********************************************************!*\
  !*** ./apps/auth-service/src/auth-service.controller.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const auth_service_service_1 = __webpack_require__(/*! ./auth-service.service */ "./apps/auth-service/src/auth-service.service.ts");
const auth_dto_1 = __webpack_require__(/*! ./dto/auth.dto */ "./apps/auth-service/src/dto/auth.dto.ts");
let AuthServiceController = class AuthServiceController {
    authServiceService;
    constructor(authServiceService) {
        this.authServiceService = authServiceService;
    }
    async register(data) {
        return this.authServiceService.register(data);
    }
    async login(data) {
        return this.authServiceService.login(data);
    }
    async validateToken(data) {
        return this.authServiceService.validateToken(data.token);
    }
    async getUserById(data) {
        return this.authServiceService.findUserById(data.id);
    }
    async createUser(data) {
        return this.authServiceService.createUser(data.email, data.passwordHash);
    }
    async getUser(data) {
        return this.authServiceService.findUserByEmail(data.email);
    }
};
exports.AuthServiceController = AuthServiceController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'register' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.RegisterUserDto !== "undefined" && auth_dto_1.RegisterUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "register", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'login' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof auth_dto_1.LoginUserDto !== "undefined" && auth_dto_1.LoginUserDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'validateToken' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "validateToken", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'getUserById' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "getUserById", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'createUser' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "createUser", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'getUser' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "getUser", null);
exports.AuthServiceController = AuthServiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_service_1.AuthServiceService !== "undefined" && auth_service_service_1.AuthServiceService) === "function" ? _a : Object])
], AuthServiceController);


/***/ }),

/***/ "./apps/auth-service/src/auth-service.module.ts":
/*!******************************************************!*\
  !*** ./apps/auth-service/src/auth-service.module.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const auth_service_controller_1 = __webpack_require__(/*! ./auth-service.controller */ "./apps/auth-service/src/auth-service.controller.ts");
const auth_service_service_1 = __webpack_require__(/*! ./auth-service.service */ "./apps/auth-service/src/auth-service.service.ts");
const user_entity_1 = __webpack_require__(/*! ./users/user.entity */ "./apps/auth-service/src/users/user.entity.ts");
let AuthServiceModule = class AuthServiceModule {
};
exports.AuthServiceModule = AuthServiceModule;
exports.AuthServiceModule = AuthServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: configService.get('POSTGRES_PORT'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    username: configService.get('POSTGRES_USER'),
                    database: configService.get('POSTGRES_DB'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const expiresIn = configService.get('JWT_EXPIRATION') || '24h';
                    return {
                        secret: configService.get('JWT_SECRET') || 'default-secret-key',
                        signOptions: {
                            expiresIn: expiresIn,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_service_controller_1.AuthServiceController],
        providers: [auth_service_service_1.AuthServiceService],
    })
], AuthServiceModule);


/***/ }),

/***/ "./apps/auth-service/src/auth-service.service.ts":
/*!*******************************************************!*\
  !*** ./apps/auth-service/src/auth-service.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const user_entity_1 = __webpack_require__(/*! ./users/user.entity */ "./apps/auth-service/src/users/user.entity.ts");
let AuthServiceService = class AuthServiceService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, role } = registerDto;
        console.log('Registering user:', email);
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', email);
            throw new common_1.UnauthorizedException('User with this email already exists');
        }
        console.log('Hashing password...');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        console.log('Saving user to DB...');
        const user = this.userRepository.create({
            email,
            passwordHash,
            role: role || 'manager',
        });
        const savedUser = await this.userRepository.save(user);
        console.log('User saved:', savedUser.id);
        const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
            },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            return this.userRepository.findOne({ where: { id: payload.sub } });
        }
        catch (error) {
            return null;
        }
    }
    async findUserByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findUserById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async createUser(email, passwordHash) {
        const user = this.userRepository.create({ email, passwordHash });
        return this.userRepository.save(user);
    }
};
exports.AuthServiceService = AuthServiceService;
exports.AuthServiceService = AuthServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], AuthServiceService);


/***/ }),

/***/ "./apps/auth-service/src/dto/auth.dto.ts":
/*!***********************************************!*\
  !*** ./apps/auth-service/src/dto/auth.dto.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseDto = exports.LoginUserDto = exports.RegisterUserDto = void 0;
class RegisterUserDto {
    email;
    password;
    role;
}
exports.RegisterUserDto = RegisterUserDto;
class LoginUserDto {
    email;
    password;
}
exports.LoginUserDto = LoginUserDto;
class AuthResponseDto {
    access_token;
    user;
}
exports.AuthResponseDto = AuthResponseDto;


/***/ }),

/***/ "./apps/auth-service/src/users/user.entity.ts":
/*!****************************************************!*\
  !*** ./apps/auth-service/src/users/user.entity.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let User = class User {
    id;
    email;
    passwordHash;
    role;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'manager' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "@nestjs/typeorm":
/*!**********************************!*\
  !*** external "@nestjs/typeorm" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("typeorm");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***************************************!*\
  !*** ./apps/auth-service/src/main.ts ***!
  \***************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const auth_service_module_1 = __webpack_require__(/*! ./auth-service.module */ "./apps/auth-service/src/auth-service.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(auth_service_module_1.AuthServiceModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: 3001,
        },
    });
    await app.listen();
}
bootstrap();

})();

/******/ })()
;