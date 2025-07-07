
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Company
 * 
 */
export type Company = $Result.DefaultSelection<Prisma.$CompanyPayload>
/**
 * Model TransactionCache
 * 
 */
export type TransactionCache = $Result.DefaultSelection<Prisma.$TransactionCachePayload>
/**
 * Model Rule
 * 
 */
export type Rule = $Result.DefaultSelection<Prisma.$RulePayload>
/**
 * Model RuleCandidate
 * 
 */
export type RuleCandidate = $Result.DefaultSelection<Prisma.$RuleCandidatePayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>
/**
 * Model DatacollectionGyeonggiDelivery
 * 
 */
export type DatacollectionGyeonggiDelivery = $Result.DefaultSelection<Prisma.$DatacollectionGyeonggiDeliveryPayload>
/**
 * Model DatacollectionSeoulRestaurants
 * 
 */
export type DatacollectionSeoulRestaurants = $Result.DefaultSelection<Prisma.$DatacollectionSeoulRestaurantsPayload>
/**
 * Model RuleEngine
 * 
 */
export type RuleEngine = $Result.DefaultSelection<Prisma.$RuleEnginePayload>
/**
 * Model RuleEngineCandidate
 * 
 */
export type RuleEngineCandidate = $Result.DefaultSelection<Prisma.$RuleEngineCandidatePayload>
/**
 * Model RuleEngineFeedback
 * 
 */
export type RuleEngineFeedback = $Result.DefaultSelection<Prisma.$RuleEngineFeedbackPayload>
/**
 * Model FranchiseBrands
 * 
 */
export type FranchiseBrands = $Result.DefaultSelection<Prisma.$FranchiseBrandsPayload>
/**
 * Model NationalPensionWorkplaces
 * 
 */
export type NationalPensionWorkplaces = $Result.DefaultSelection<Prisma.$NationalPensionWorkplacesPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TaxpayerType: {
  CORPORATION: 'CORPORATION',
  SOLE_PROPRIETORSHIP: 'SOLE_PROPRIETORSHIP'
};

export type TaxpayerType = (typeof TaxpayerType)[keyof typeof TaxpayerType]


export const RuleCreator: {
  ADMIN: 'ADMIN',
  AUTO_GENERATED: 'AUTO_GENERATED'
};

export type RuleCreator = (typeof RuleCreator)[keyof typeof RuleCreator]


export const TransactionStatus: {
  NORMALIZED: 'NORMALIZED',
  RULE_PROCESSED: 'RULE_PROCESSED',
  NEEDS_CLARIFICATION: 'NEEDS_CLARIFICATION',
  LLM_PROCESSED: 'LLM_PROCESSED',
  CLARIFIED: 'CLARIFIED',
  NEEDS_REVIEW: 'NEEDS_REVIEW'
};

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus]


export const ProcessorType: {
  CACHE: 'CACHE',
  REGEX_FILTER: 'REGEX_FILTER',
  INFERENCE_ML: 'INFERENCE_ML',
  NORMALIZER_LLM: 'NORMALIZER_LLM',
  RULE_ENGINE: 'RULE_ENGINE',
  ANALYZER_LLM: 'ANALYZER_LLM'
};

export type ProcessorType = (typeof ProcessorType)[keyof typeof ProcessorType]


export const TransactionIOType: {
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME'
};

export type TransactionIOType = (typeof TransactionIOType)[keyof typeof TransactionIOType]

}

export type TaxpayerType = $Enums.TaxpayerType

export const TaxpayerType: typeof $Enums.TaxpayerType

export type RuleCreator = $Enums.RuleCreator

export const RuleCreator: typeof $Enums.RuleCreator

export type TransactionStatus = $Enums.TransactionStatus

export const TransactionStatus: typeof $Enums.TransactionStatus

export type ProcessorType = $Enums.ProcessorType

export const ProcessorType: typeof $Enums.ProcessorType

export type TransactionIOType = $Enums.TransactionIOType

export const TransactionIOType: typeof $Enums.TransactionIOType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Companies
 * const companies = await prisma.company.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Companies
   * const companies = await prisma.company.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.company`: Exposes CRUD operations for the **Company** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Companies
    * const companies = await prisma.company.findMany()
    * ```
    */
  get company(): Prisma.CompanyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transactionCache`: Exposes CRUD operations for the **TransactionCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TransactionCaches
    * const transactionCaches = await prisma.transactionCache.findMany()
    * ```
    */
  get transactionCache(): Prisma.TransactionCacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rule`: Exposes CRUD operations for the **Rule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rules
    * const rules = await prisma.rule.findMany()
    * ```
    */
  get rule(): Prisma.RuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ruleCandidate`: Exposes CRUD operations for the **RuleCandidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RuleCandidates
    * const ruleCandidates = await prisma.ruleCandidate.findMany()
    * ```
    */
  get ruleCandidate(): Prisma.RuleCandidateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.datacollectionGyeonggiDelivery`: Exposes CRUD operations for the **DatacollectionGyeonggiDelivery** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatacollectionGyeonggiDeliveries
    * const datacollectionGyeonggiDeliveries = await prisma.datacollectionGyeonggiDelivery.findMany()
    * ```
    */
  get datacollectionGyeonggiDelivery(): Prisma.DatacollectionGyeonggiDeliveryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.datacollectionSeoulRestaurants`: Exposes CRUD operations for the **DatacollectionSeoulRestaurants** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatacollectionSeoulRestaurants
    * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findMany()
    * ```
    */
  get datacollectionSeoulRestaurants(): Prisma.DatacollectionSeoulRestaurantsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ruleEngine`: Exposes CRUD operations for the **RuleEngine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RuleEngines
    * const ruleEngines = await prisma.ruleEngine.findMany()
    * ```
    */
  get ruleEngine(): Prisma.RuleEngineDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ruleEngineCandidate`: Exposes CRUD operations for the **RuleEngineCandidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RuleEngineCandidates
    * const ruleEngineCandidates = await prisma.ruleEngineCandidate.findMany()
    * ```
    */
  get ruleEngineCandidate(): Prisma.RuleEngineCandidateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ruleEngineFeedback`: Exposes CRUD operations for the **RuleEngineFeedback** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RuleEngineFeedbacks
    * const ruleEngineFeedbacks = await prisma.ruleEngineFeedback.findMany()
    * ```
    */
  get ruleEngineFeedback(): Prisma.RuleEngineFeedbackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.franchiseBrands`: Exposes CRUD operations for the **FranchiseBrands** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FranchiseBrands
    * const franchiseBrands = await prisma.franchiseBrands.findMany()
    * ```
    */
  get franchiseBrands(): Prisma.FranchiseBrandsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nationalPensionWorkplaces`: Exposes CRUD operations for the **NationalPensionWorkplaces** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NationalPensionWorkplaces
    * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findMany()
    * ```
    */
  get nationalPensionWorkplaces(): Prisma.NationalPensionWorkplacesDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.11.0
   * Query Engine version: 9c30299f5a0ea26a96790e13f796dc6094db3173
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Company: 'Company',
    TransactionCache: 'TransactionCache',
    Rule: 'Rule',
    RuleCandidate: 'RuleCandidate',
    Transaction: 'Transaction',
    DatacollectionGyeonggiDelivery: 'DatacollectionGyeonggiDelivery',
    DatacollectionSeoulRestaurants: 'DatacollectionSeoulRestaurants',
    RuleEngine: 'RuleEngine',
    RuleEngineCandidate: 'RuleEngineCandidate',
    RuleEngineFeedback: 'RuleEngineFeedback',
    FranchiseBrands: 'FranchiseBrands',
    NationalPensionWorkplaces: 'NationalPensionWorkplaces'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "company" | "transactionCache" | "rule" | "ruleCandidate" | "transaction" | "datacollectionGyeonggiDelivery" | "datacollectionSeoulRestaurants" | "ruleEngine" | "ruleEngineCandidate" | "ruleEngineFeedback" | "franchiseBrands" | "nationalPensionWorkplaces"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Company: {
        payload: Prisma.$CompanyPayload<ExtArgs>
        fields: Prisma.CompanyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CompanyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findFirst: {
            args: Prisma.CompanyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findMany: {
            args: Prisma.CompanyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          create: {
            args: Prisma.CompanyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          createMany: {
            args: Prisma.CompanyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          delete: {
            args: Prisma.CompanyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          update: {
            args: Prisma.CompanyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          deleteMany: {
            args: Prisma.CompanyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CompanyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CompanyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          upsert: {
            args: Prisma.CompanyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          aggregate: {
            args: Prisma.CompanyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCompany>
          }
          groupBy: {
            args: Prisma.CompanyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CompanyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompanyCountArgs<ExtArgs>
            result: $Utils.Optional<CompanyCountAggregateOutputType> | number
          }
        }
      }
      TransactionCache: {
        payload: Prisma.$TransactionCachePayload<ExtArgs>
        fields: Prisma.TransactionCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          findFirst: {
            args: Prisma.TransactionCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          findMany: {
            args: Prisma.TransactionCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>[]
          }
          create: {
            args: Prisma.TransactionCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          createMany: {
            args: Prisma.TransactionCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>[]
          }
          delete: {
            args: Prisma.TransactionCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          update: {
            args: Prisma.TransactionCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          deleteMany: {
            args: Prisma.TransactionCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>[]
          }
          upsert: {
            args: Prisma.TransactionCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionCachePayload>
          }
          aggregate: {
            args: Prisma.TransactionCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransactionCache>
          }
          groupBy: {
            args: Prisma.TransactionCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCacheCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCacheCountAggregateOutputType> | number
          }
        }
      }
      Rule: {
        payload: Prisma.$RulePayload<ExtArgs>
        fields: Prisma.RuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          findFirst: {
            args: Prisma.RuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          findMany: {
            args: Prisma.RuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>[]
          }
          create: {
            args: Prisma.RuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          createMany: {
            args: Prisma.RuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>[]
          }
          delete: {
            args: Prisma.RuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          update: {
            args: Prisma.RuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          deleteMany: {
            args: Prisma.RuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>[]
          }
          upsert: {
            args: Prisma.RuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RulePayload>
          }
          aggregate: {
            args: Prisma.RuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRule>
          }
          groupBy: {
            args: Prisma.RuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RuleCountArgs<ExtArgs>
            result: $Utils.Optional<RuleCountAggregateOutputType> | number
          }
        }
      }
      RuleCandidate: {
        payload: Prisma.$RuleCandidatePayload<ExtArgs>
        fields: Prisma.RuleCandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RuleCandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RuleCandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          findFirst: {
            args: Prisma.RuleCandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RuleCandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          findMany: {
            args: Prisma.RuleCandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>[]
          }
          create: {
            args: Prisma.RuleCandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          createMany: {
            args: Prisma.RuleCandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RuleCandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>[]
          }
          delete: {
            args: Prisma.RuleCandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          update: {
            args: Prisma.RuleCandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          deleteMany: {
            args: Prisma.RuleCandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RuleCandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RuleCandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>[]
          }
          upsert: {
            args: Prisma.RuleCandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleCandidatePayload>
          }
          aggregate: {
            args: Prisma.RuleCandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRuleCandidate>
          }
          groupBy: {
            args: Prisma.RuleCandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<RuleCandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.RuleCandidateCountArgs<ExtArgs>
            result: $Utils.Optional<RuleCandidateCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
      DatacollectionGyeonggiDelivery: {
        payload: Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>
        fields: Prisma.DatacollectionGyeonggiDeliveryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatacollectionGyeonggiDeliveryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatacollectionGyeonggiDeliveryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          findFirst: {
            args: Prisma.DatacollectionGyeonggiDeliveryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatacollectionGyeonggiDeliveryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          findMany: {
            args: Prisma.DatacollectionGyeonggiDeliveryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>[]
          }
          create: {
            args: Prisma.DatacollectionGyeonggiDeliveryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          createMany: {
            args: Prisma.DatacollectionGyeonggiDeliveryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatacollectionGyeonggiDeliveryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>[]
          }
          delete: {
            args: Prisma.DatacollectionGyeonggiDeliveryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          update: {
            args: Prisma.DatacollectionGyeonggiDeliveryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          deleteMany: {
            args: Prisma.DatacollectionGyeonggiDeliveryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatacollectionGyeonggiDeliveryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatacollectionGyeonggiDeliveryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>[]
          }
          upsert: {
            args: Prisma.DatacollectionGyeonggiDeliveryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionGyeonggiDeliveryPayload>
          }
          aggregate: {
            args: Prisma.DatacollectionGyeonggiDeliveryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatacollectionGyeonggiDelivery>
          }
          groupBy: {
            args: Prisma.DatacollectionGyeonggiDeliveryGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatacollectionGyeonggiDeliveryGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatacollectionGyeonggiDeliveryCountArgs<ExtArgs>
            result: $Utils.Optional<DatacollectionGyeonggiDeliveryCountAggregateOutputType> | number
          }
        }
      }
      DatacollectionSeoulRestaurants: {
        payload: Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>
        fields: Prisma.DatacollectionSeoulRestaurantsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatacollectionSeoulRestaurantsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatacollectionSeoulRestaurantsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          findFirst: {
            args: Prisma.DatacollectionSeoulRestaurantsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatacollectionSeoulRestaurantsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          findMany: {
            args: Prisma.DatacollectionSeoulRestaurantsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>[]
          }
          create: {
            args: Prisma.DatacollectionSeoulRestaurantsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          createMany: {
            args: Prisma.DatacollectionSeoulRestaurantsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatacollectionSeoulRestaurantsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>[]
          }
          delete: {
            args: Prisma.DatacollectionSeoulRestaurantsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          update: {
            args: Prisma.DatacollectionSeoulRestaurantsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          deleteMany: {
            args: Prisma.DatacollectionSeoulRestaurantsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatacollectionSeoulRestaurantsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatacollectionSeoulRestaurantsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>[]
          }
          upsert: {
            args: Prisma.DatacollectionSeoulRestaurantsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatacollectionSeoulRestaurantsPayload>
          }
          aggregate: {
            args: Prisma.DatacollectionSeoulRestaurantsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatacollectionSeoulRestaurants>
          }
          groupBy: {
            args: Prisma.DatacollectionSeoulRestaurantsGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatacollectionSeoulRestaurantsGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatacollectionSeoulRestaurantsCountArgs<ExtArgs>
            result: $Utils.Optional<DatacollectionSeoulRestaurantsCountAggregateOutputType> | number
          }
        }
      }
      RuleEngine: {
        payload: Prisma.$RuleEnginePayload<ExtArgs>
        fields: Prisma.RuleEngineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RuleEngineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RuleEngineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          findFirst: {
            args: Prisma.RuleEngineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RuleEngineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          findMany: {
            args: Prisma.RuleEngineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>[]
          }
          create: {
            args: Prisma.RuleEngineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          createMany: {
            args: Prisma.RuleEngineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RuleEngineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>[]
          }
          delete: {
            args: Prisma.RuleEngineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          update: {
            args: Prisma.RuleEngineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          deleteMany: {
            args: Prisma.RuleEngineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RuleEngineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RuleEngineUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>[]
          }
          upsert: {
            args: Prisma.RuleEngineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEnginePayload>
          }
          aggregate: {
            args: Prisma.RuleEngineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRuleEngine>
          }
          groupBy: {
            args: Prisma.RuleEngineGroupByArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineGroupByOutputType>[]
          }
          count: {
            args: Prisma.RuleEngineCountArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineCountAggregateOutputType> | number
          }
        }
      }
      RuleEngineCandidate: {
        payload: Prisma.$RuleEngineCandidatePayload<ExtArgs>
        fields: Prisma.RuleEngineCandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RuleEngineCandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RuleEngineCandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          findFirst: {
            args: Prisma.RuleEngineCandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RuleEngineCandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          findMany: {
            args: Prisma.RuleEngineCandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>[]
          }
          create: {
            args: Prisma.RuleEngineCandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          createMany: {
            args: Prisma.RuleEngineCandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RuleEngineCandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>[]
          }
          delete: {
            args: Prisma.RuleEngineCandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          update: {
            args: Prisma.RuleEngineCandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          deleteMany: {
            args: Prisma.RuleEngineCandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RuleEngineCandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RuleEngineCandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>[]
          }
          upsert: {
            args: Prisma.RuleEngineCandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineCandidatePayload>
          }
          aggregate: {
            args: Prisma.RuleEngineCandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRuleEngineCandidate>
          }
          groupBy: {
            args: Prisma.RuleEngineCandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineCandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.RuleEngineCandidateCountArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineCandidateCountAggregateOutputType> | number
          }
        }
      }
      RuleEngineFeedback: {
        payload: Prisma.$RuleEngineFeedbackPayload<ExtArgs>
        fields: Prisma.RuleEngineFeedbackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RuleEngineFeedbackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RuleEngineFeedbackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          findFirst: {
            args: Prisma.RuleEngineFeedbackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RuleEngineFeedbackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          findMany: {
            args: Prisma.RuleEngineFeedbackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>[]
          }
          create: {
            args: Prisma.RuleEngineFeedbackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          createMany: {
            args: Prisma.RuleEngineFeedbackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RuleEngineFeedbackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>[]
          }
          delete: {
            args: Prisma.RuleEngineFeedbackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          update: {
            args: Prisma.RuleEngineFeedbackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          deleteMany: {
            args: Prisma.RuleEngineFeedbackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RuleEngineFeedbackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RuleEngineFeedbackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>[]
          }
          upsert: {
            args: Prisma.RuleEngineFeedbackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RuleEngineFeedbackPayload>
          }
          aggregate: {
            args: Prisma.RuleEngineFeedbackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRuleEngineFeedback>
          }
          groupBy: {
            args: Prisma.RuleEngineFeedbackGroupByArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineFeedbackGroupByOutputType>[]
          }
          count: {
            args: Prisma.RuleEngineFeedbackCountArgs<ExtArgs>
            result: $Utils.Optional<RuleEngineFeedbackCountAggregateOutputType> | number
          }
        }
      }
      FranchiseBrands: {
        payload: Prisma.$FranchiseBrandsPayload<ExtArgs>
        fields: Prisma.FranchiseBrandsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FranchiseBrandsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FranchiseBrandsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          findFirst: {
            args: Prisma.FranchiseBrandsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FranchiseBrandsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          findMany: {
            args: Prisma.FranchiseBrandsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>[]
          }
          create: {
            args: Prisma.FranchiseBrandsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          createMany: {
            args: Prisma.FranchiseBrandsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FranchiseBrandsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>[]
          }
          delete: {
            args: Prisma.FranchiseBrandsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          update: {
            args: Prisma.FranchiseBrandsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          deleteMany: {
            args: Prisma.FranchiseBrandsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FranchiseBrandsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FranchiseBrandsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>[]
          }
          upsert: {
            args: Prisma.FranchiseBrandsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FranchiseBrandsPayload>
          }
          aggregate: {
            args: Prisma.FranchiseBrandsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFranchiseBrands>
          }
          groupBy: {
            args: Prisma.FranchiseBrandsGroupByArgs<ExtArgs>
            result: $Utils.Optional<FranchiseBrandsGroupByOutputType>[]
          }
          count: {
            args: Prisma.FranchiseBrandsCountArgs<ExtArgs>
            result: $Utils.Optional<FranchiseBrandsCountAggregateOutputType> | number
          }
        }
      }
      NationalPensionWorkplaces: {
        payload: Prisma.$NationalPensionWorkplacesPayload<ExtArgs>
        fields: Prisma.NationalPensionWorkplacesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NationalPensionWorkplacesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NationalPensionWorkplacesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          findFirst: {
            args: Prisma.NationalPensionWorkplacesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NationalPensionWorkplacesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          findMany: {
            args: Prisma.NationalPensionWorkplacesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>[]
          }
          create: {
            args: Prisma.NationalPensionWorkplacesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          createMany: {
            args: Prisma.NationalPensionWorkplacesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NationalPensionWorkplacesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>[]
          }
          delete: {
            args: Prisma.NationalPensionWorkplacesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          update: {
            args: Prisma.NationalPensionWorkplacesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          deleteMany: {
            args: Prisma.NationalPensionWorkplacesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NationalPensionWorkplacesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NationalPensionWorkplacesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>[]
          }
          upsert: {
            args: Prisma.NationalPensionWorkplacesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NationalPensionWorkplacesPayload>
          }
          aggregate: {
            args: Prisma.NationalPensionWorkplacesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNationalPensionWorkplaces>
          }
          groupBy: {
            args: Prisma.NationalPensionWorkplacesGroupByArgs<ExtArgs>
            result: $Utils.Optional<NationalPensionWorkplacesGroupByOutputType>[]
          }
          count: {
            args: Prisma.NationalPensionWorkplacesCountArgs<ExtArgs>
            result: $Utils.Optional<NationalPensionWorkplacesCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    company?: CompanyOmit
    transactionCache?: TransactionCacheOmit
    rule?: RuleOmit
    ruleCandidate?: RuleCandidateOmit
    transaction?: TransactionOmit
    datacollectionGyeonggiDelivery?: DatacollectionGyeonggiDeliveryOmit
    datacollectionSeoulRestaurants?: DatacollectionSeoulRestaurantsOmit
    ruleEngine?: RuleEngineOmit
    ruleEngineCandidate?: RuleEngineCandidateOmit
    ruleEngineFeedback?: RuleEngineFeedbackOmit
    franchiseBrands?: FranchiseBrandsOmit
    nationalPensionWorkplaces?: NationalPensionWorkplacesOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CompanyCountOutputType
   */

  export type CompanyCountOutputType = {
    ruleCandidates: number
    rules: number
    transactions: number
  }

  export type CompanyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ruleCandidates?: boolean | CompanyCountOutputTypeCountRuleCandidatesArgs
    rules?: boolean | CompanyCountOutputTypeCountRulesArgs
    transactions?: boolean | CompanyCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompanyCountOutputType
     */
    select?: CompanyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountRuleCandidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleCandidateWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Company
   */

  export type AggregateCompany = {
    _count: CompanyCountAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  export type CompanyMinAggregateOutputType = {
    id: string | null
    companyName: string | null
    businessRegistrationNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
    taxpayerType: $Enums.TaxpayerType | null
  }

  export type CompanyMaxAggregateOutputType = {
    id: string | null
    companyName: string | null
    businessRegistrationNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
    taxpayerType: $Enums.TaxpayerType | null
  }

  export type CompanyCountAggregateOutputType = {
    id: number
    companyName: number
    businessRegistrationNumber: number
    createdAt: number
    updatedAt: number
    taxpayerType: number
    _all: number
  }


  export type CompanyMinAggregateInputType = {
    id?: true
    companyName?: true
    businessRegistrationNumber?: true
    createdAt?: true
    updatedAt?: true
    taxpayerType?: true
  }

  export type CompanyMaxAggregateInputType = {
    id?: true
    companyName?: true
    businessRegistrationNumber?: true
    createdAt?: true
    updatedAt?: true
    taxpayerType?: true
  }

  export type CompanyCountAggregateInputType = {
    id?: true
    companyName?: true
    businessRegistrationNumber?: true
    createdAt?: true
    updatedAt?: true
    taxpayerType?: true
    _all?: true
  }

  export type CompanyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Company to aggregate.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Companies
    **/
    _count?: true | CompanyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompanyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompanyMaxAggregateInputType
  }

  export type GetCompanyAggregateType<T extends CompanyAggregateArgs> = {
        [P in keyof T & keyof AggregateCompany]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompany[P]>
      : GetScalarType<T[P], AggregateCompany[P]>
  }




  export type CompanyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompanyWhereInput
    orderBy?: CompanyOrderByWithAggregationInput | CompanyOrderByWithAggregationInput[]
    by: CompanyScalarFieldEnum[] | CompanyScalarFieldEnum
    having?: CompanyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompanyCountAggregateInputType | true
    _min?: CompanyMinAggregateInputType
    _max?: CompanyMaxAggregateInputType
  }

  export type CompanyGroupByOutputType = {
    id: string
    companyName: string
    businessRegistrationNumber: string | null
    createdAt: Date
    updatedAt: Date
    taxpayerType: $Enums.TaxpayerType
    _count: CompanyCountAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  type GetCompanyGroupByPayload<T extends CompanyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CompanyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompanyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompanyGroupByOutputType[P]>
            : GetScalarType<T[P], CompanyGroupByOutputType[P]>
        }
      >
    >


  export type CompanySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyName?: boolean
    businessRegistrationNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taxpayerType?: boolean
    ruleCandidates?: boolean | Company$ruleCandidatesArgs<ExtArgs>
    rules?: boolean | Company$rulesArgs<ExtArgs>
    transactions?: boolean | Company$transactionsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["company"]>

  export type CompanySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyName?: boolean
    businessRegistrationNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taxpayerType?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyName?: boolean
    businessRegistrationNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taxpayerType?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectScalar = {
    id?: boolean
    companyName?: boolean
    businessRegistrationNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taxpayerType?: boolean
  }

  export type CompanyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "companyName" | "businessRegistrationNumber" | "createdAt" | "updatedAt" | "taxpayerType", ExtArgs["result"]["company"]>
  export type CompanyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ruleCandidates?: boolean | Company$ruleCandidatesArgs<ExtArgs>
    rules?: boolean | Company$rulesArgs<ExtArgs>
    transactions?: boolean | Company$transactionsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CompanyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CompanyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CompanyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Company"
    objects: {
      ruleCandidates: Prisma.$RuleCandidatePayload<ExtArgs>[]
      rules: Prisma.$RulePayload<ExtArgs>[]
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      companyName: string
      businessRegistrationNumber: string | null
      createdAt: Date
      updatedAt: Date
      taxpayerType: $Enums.TaxpayerType
    }, ExtArgs["result"]["company"]>
    composites: {}
  }

  type CompanyGetPayload<S extends boolean | null | undefined | CompanyDefaultArgs> = $Result.GetResult<Prisma.$CompanyPayload, S>

  type CompanyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CompanyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CompanyCountAggregateInputType | true
    }

  export interface CompanyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Company'], meta: { name: 'Company' } }
    /**
     * Find zero or one Company that matches the filter.
     * @param {CompanyFindUniqueArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CompanyFindUniqueArgs>(args: SelectSubset<T, CompanyFindUniqueArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Company that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CompanyFindUniqueOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CompanyFindUniqueOrThrowArgs>(args: SelectSubset<T, CompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CompanyFindFirstArgs>(args?: SelectSubset<T, CompanyFindFirstArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CompanyFindFirstOrThrowArgs>(args?: SelectSubset<T, CompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Companies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Companies
     * const companies = await prisma.company.findMany()
     * 
     * // Get first 10 Companies
     * const companies = await prisma.company.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const companyWithIdOnly = await prisma.company.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CompanyFindManyArgs>(args?: SelectSubset<T, CompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Company.
     * @param {CompanyCreateArgs} args - Arguments to create a Company.
     * @example
     * // Create one Company
     * const Company = await prisma.company.create({
     *   data: {
     *     // ... data to create a Company
     *   }
     * })
     * 
     */
    create<T extends CompanyCreateArgs>(args: SelectSubset<T, CompanyCreateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Companies.
     * @param {CompanyCreateManyArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CompanyCreateManyArgs>(args?: SelectSubset<T, CompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Companies and returns the data saved in the database.
     * @param {CompanyCreateManyAndReturnArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CompanyCreateManyAndReturnArgs>(args?: SelectSubset<T, CompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Company.
     * @param {CompanyDeleteArgs} args - Arguments to delete one Company.
     * @example
     * // Delete one Company
     * const Company = await prisma.company.delete({
     *   where: {
     *     // ... filter to delete one Company
     *   }
     * })
     * 
     */
    delete<T extends CompanyDeleteArgs>(args: SelectSubset<T, CompanyDeleteArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Company.
     * @param {CompanyUpdateArgs} args - Arguments to update one Company.
     * @example
     * // Update one Company
     * const company = await prisma.company.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CompanyUpdateArgs>(args: SelectSubset<T, CompanyUpdateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Companies.
     * @param {CompanyDeleteManyArgs} args - Arguments to filter Companies to delete.
     * @example
     * // Delete a few Companies
     * const { count } = await prisma.company.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CompanyDeleteManyArgs>(args?: SelectSubset<T, CompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CompanyUpdateManyArgs>(args: SelectSubset<T, CompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies and returns the data updated in the database.
     * @param {CompanyUpdateManyAndReturnArgs} args - Arguments to update many Companies.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CompanyUpdateManyAndReturnArgs>(args: SelectSubset<T, CompanyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Company.
     * @param {CompanyUpsertArgs} args - Arguments to update or create a Company.
     * @example
     * // Update or create a Company
     * const company = await prisma.company.upsert({
     *   create: {
     *     // ... data to create a Company
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Company we want to update
     *   }
     * })
     */
    upsert<T extends CompanyUpsertArgs>(args: SelectSubset<T, CompanyUpsertArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyCountArgs} args - Arguments to filter Companies to count.
     * @example
     * // Count the number of Companies
     * const count = await prisma.company.count({
     *   where: {
     *     // ... the filter for the Companies we want to count
     *   }
     * })
    **/
    count<T extends CompanyCountArgs>(
      args?: Subset<T, CompanyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompanyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompanyAggregateArgs>(args: Subset<T, CompanyAggregateArgs>): Prisma.PrismaPromise<GetCompanyAggregateType<T>>

    /**
     * Group by Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompanyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompanyGroupByArgs['orderBy'] }
        : { orderBy?: CompanyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Company model
   */
  readonly fields: CompanyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Company.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CompanyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ruleCandidates<T extends Company$ruleCandidatesArgs<ExtArgs> = {}>(args?: Subset<T, Company$ruleCandidatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    rules<T extends Company$rulesArgs<ExtArgs> = {}>(args?: Subset<T, Company$rulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    transactions<T extends Company$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Company$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Company model
   */
  interface CompanyFieldRefs {
    readonly id: FieldRef<"Company", 'String'>
    readonly companyName: FieldRef<"Company", 'String'>
    readonly businessRegistrationNumber: FieldRef<"Company", 'String'>
    readonly createdAt: FieldRef<"Company", 'DateTime'>
    readonly updatedAt: FieldRef<"Company", 'DateTime'>
    readonly taxpayerType: FieldRef<"Company", 'TaxpayerType'>
  }
    

  // Custom InputTypes
  /**
   * Company findUnique
   */
  export type CompanyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findUniqueOrThrow
   */
  export type CompanyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findFirst
   */
  export type CompanyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findFirstOrThrow
   */
  export type CompanyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findMany
   */
  export type CompanyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Companies to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company create
   */
  export type CompanyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to create a Company.
     */
    data: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
  }

  /**
   * Company createMany
   */
  export type CompanyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company createManyAndReturn
   */
  export type CompanyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company update
   */
  export type CompanyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to update a Company.
     */
    data: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
    /**
     * Choose, which Company to update.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company updateMany
   */
  export type CompanyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company updateManyAndReturn
   */
  export type CompanyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company upsert
   */
  export type CompanyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The filter to search for the Company to update in case it exists.
     */
    where: CompanyWhereUniqueInput
    /**
     * In case the Company found by the `where` argument doesn't exist, create a new Company with this data.
     */
    create: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
    /**
     * In case the Company was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
  }

  /**
   * Company delete
   */
  export type CompanyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter which Company to delete.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company deleteMany
   */
  export type CompanyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Companies to delete
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to delete.
     */
    limit?: number
  }

  /**
   * Company.ruleCandidates
   */
  export type Company$ruleCandidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    where?: RuleCandidateWhereInput
    orderBy?: RuleCandidateOrderByWithRelationInput | RuleCandidateOrderByWithRelationInput[]
    cursor?: RuleCandidateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RuleCandidateScalarFieldEnum | RuleCandidateScalarFieldEnum[]
  }

  /**
   * Company.rules
   */
  export type Company$rulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    where?: RuleWhereInput
    orderBy?: RuleOrderByWithRelationInput | RuleOrderByWithRelationInput[]
    cursor?: RuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RuleScalarFieldEnum | RuleScalarFieldEnum[]
  }

  /**
   * Company.transactions
   */
  export type Company$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Company without action
   */
  export type CompanyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
  }


  /**
   * Model TransactionCache
   */

  export type AggregateTransactionCache = {
    _count: TransactionCacheCountAggregateOutputType | null
    _min: TransactionCacheMinAggregateOutputType | null
    _max: TransactionCacheMaxAggregateOutputType | null
  }

  export type TransactionCacheMinAggregateOutputType = {
    rawTextHash: string | null
    rawText: string | null
    uniqueKey: string | null
    createdAt: Date | null
  }

  export type TransactionCacheMaxAggregateOutputType = {
    rawTextHash: string | null
    rawText: string | null
    uniqueKey: string | null
    createdAt: Date | null
  }

  export type TransactionCacheCountAggregateOutputType = {
    rawTextHash: number
    rawText: number
    uniqueKey: number
    createdAt: number
    _all: number
  }


  export type TransactionCacheMinAggregateInputType = {
    rawTextHash?: true
    rawText?: true
    uniqueKey?: true
    createdAt?: true
  }

  export type TransactionCacheMaxAggregateInputType = {
    rawTextHash?: true
    rawText?: true
    uniqueKey?: true
    createdAt?: true
  }

  export type TransactionCacheCountAggregateInputType = {
    rawTextHash?: true
    rawText?: true
    uniqueKey?: true
    createdAt?: true
    _all?: true
  }

  export type TransactionCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionCache to aggregate.
     */
    where?: TransactionCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionCaches to fetch.
     */
    orderBy?: TransactionCacheOrderByWithRelationInput | TransactionCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TransactionCaches
    **/
    _count?: true | TransactionCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionCacheMaxAggregateInputType
  }

  export type GetTransactionCacheAggregateType<T extends TransactionCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateTransactionCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransactionCache[P]>
      : GetScalarType<T[P], AggregateTransactionCache[P]>
  }




  export type TransactionCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionCacheWhereInput
    orderBy?: TransactionCacheOrderByWithAggregationInput | TransactionCacheOrderByWithAggregationInput[]
    by: TransactionCacheScalarFieldEnum[] | TransactionCacheScalarFieldEnum
    having?: TransactionCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCacheCountAggregateInputType | true
    _min?: TransactionCacheMinAggregateInputType
    _max?: TransactionCacheMaxAggregateInputType
  }

  export type TransactionCacheGroupByOutputType = {
    rawTextHash: string
    rawText: string
    uniqueKey: string
    createdAt: Date
    _count: TransactionCacheCountAggregateOutputType | null
    _min: TransactionCacheMinAggregateOutputType | null
    _max: TransactionCacheMaxAggregateOutputType | null
  }

  type GetTransactionCacheGroupByPayload<T extends TransactionCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionCacheGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionCacheGroupByOutputType[P]>
        }
      >
    >


  export type TransactionCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    rawTextHash?: boolean
    rawText?: boolean
    uniqueKey?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["transactionCache"]>

  export type TransactionCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    rawTextHash?: boolean
    rawText?: boolean
    uniqueKey?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["transactionCache"]>

  export type TransactionCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    rawTextHash?: boolean
    rawText?: boolean
    uniqueKey?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["transactionCache"]>

  export type TransactionCacheSelectScalar = {
    rawTextHash?: boolean
    rawText?: boolean
    uniqueKey?: boolean
    createdAt?: boolean
  }

  export type TransactionCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"rawTextHash" | "rawText" | "uniqueKey" | "createdAt", ExtArgs["result"]["transactionCache"]>

  export type $TransactionCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TransactionCache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      rawTextHash: string
      rawText: string
      uniqueKey: string
      createdAt: Date
    }, ExtArgs["result"]["transactionCache"]>
    composites: {}
  }

  type TransactionCacheGetPayload<S extends boolean | null | undefined | TransactionCacheDefaultArgs> = $Result.GetResult<Prisma.$TransactionCachePayload, S>

  type TransactionCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCacheCountAggregateInputType | true
    }

  export interface TransactionCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TransactionCache'], meta: { name: 'TransactionCache' } }
    /**
     * Find zero or one TransactionCache that matches the filter.
     * @param {TransactionCacheFindUniqueArgs} args - Arguments to find a TransactionCache
     * @example
     * // Get one TransactionCache
     * const transactionCache = await prisma.transactionCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionCacheFindUniqueArgs>(args: SelectSubset<T, TransactionCacheFindUniqueArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TransactionCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionCacheFindUniqueOrThrowArgs} args - Arguments to find a TransactionCache
     * @example
     * // Get one TransactionCache
     * const transactionCache = await prisma.transactionCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheFindFirstArgs} args - Arguments to find a TransactionCache
     * @example
     * // Get one TransactionCache
     * const transactionCache = await prisma.transactionCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionCacheFindFirstArgs>(args?: SelectSubset<T, TransactionCacheFindFirstArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheFindFirstOrThrowArgs} args - Arguments to find a TransactionCache
     * @example
     * // Get one TransactionCache
     * const transactionCache = await prisma.transactionCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TransactionCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TransactionCaches
     * const transactionCaches = await prisma.transactionCache.findMany()
     * 
     * // Get first 10 TransactionCaches
     * const transactionCaches = await prisma.transactionCache.findMany({ take: 10 })
     * 
     * // Only select the `rawTextHash`
     * const transactionCacheWithRawTextHashOnly = await prisma.transactionCache.findMany({ select: { rawTextHash: true } })
     * 
     */
    findMany<T extends TransactionCacheFindManyArgs>(args?: SelectSubset<T, TransactionCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TransactionCache.
     * @param {TransactionCacheCreateArgs} args - Arguments to create a TransactionCache.
     * @example
     * // Create one TransactionCache
     * const TransactionCache = await prisma.transactionCache.create({
     *   data: {
     *     // ... data to create a TransactionCache
     *   }
     * })
     * 
     */
    create<T extends TransactionCacheCreateArgs>(args: SelectSubset<T, TransactionCacheCreateArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TransactionCaches.
     * @param {TransactionCacheCreateManyArgs} args - Arguments to create many TransactionCaches.
     * @example
     * // Create many TransactionCaches
     * const transactionCache = await prisma.transactionCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCacheCreateManyArgs>(args?: SelectSubset<T, TransactionCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TransactionCaches and returns the data saved in the database.
     * @param {TransactionCacheCreateManyAndReturnArgs} args - Arguments to create many TransactionCaches.
     * @example
     * // Create many TransactionCaches
     * const transactionCache = await prisma.transactionCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TransactionCaches and only return the `rawTextHash`
     * const transactionCacheWithRawTextHashOnly = await prisma.transactionCache.createManyAndReturn({
     *   select: { rawTextHash: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TransactionCache.
     * @param {TransactionCacheDeleteArgs} args - Arguments to delete one TransactionCache.
     * @example
     * // Delete one TransactionCache
     * const TransactionCache = await prisma.transactionCache.delete({
     *   where: {
     *     // ... filter to delete one TransactionCache
     *   }
     * })
     * 
     */
    delete<T extends TransactionCacheDeleteArgs>(args: SelectSubset<T, TransactionCacheDeleteArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TransactionCache.
     * @param {TransactionCacheUpdateArgs} args - Arguments to update one TransactionCache.
     * @example
     * // Update one TransactionCache
     * const transactionCache = await prisma.transactionCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionCacheUpdateArgs>(args: SelectSubset<T, TransactionCacheUpdateArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TransactionCaches.
     * @param {TransactionCacheDeleteManyArgs} args - Arguments to filter TransactionCaches to delete.
     * @example
     * // Delete a few TransactionCaches
     * const { count } = await prisma.transactionCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionCacheDeleteManyArgs>(args?: SelectSubset<T, TransactionCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TransactionCaches
     * const transactionCache = await prisma.transactionCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionCacheUpdateManyArgs>(args: SelectSubset<T, TransactionCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionCaches and returns the data updated in the database.
     * @param {TransactionCacheUpdateManyAndReturnArgs} args - Arguments to update many TransactionCaches.
     * @example
     * // Update many TransactionCaches
     * const transactionCache = await prisma.transactionCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TransactionCaches and only return the `rawTextHash`
     * const transactionCacheWithRawTextHashOnly = await prisma.transactionCache.updateManyAndReturn({
     *   select: { rawTextHash: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TransactionCache.
     * @param {TransactionCacheUpsertArgs} args - Arguments to update or create a TransactionCache.
     * @example
     * // Update or create a TransactionCache
     * const transactionCache = await prisma.transactionCache.upsert({
     *   create: {
     *     // ... data to create a TransactionCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TransactionCache we want to update
     *   }
     * })
     */
    upsert<T extends TransactionCacheUpsertArgs>(args: SelectSubset<T, TransactionCacheUpsertArgs<ExtArgs>>): Prisma__TransactionCacheClient<$Result.GetResult<Prisma.$TransactionCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TransactionCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheCountArgs} args - Arguments to filter TransactionCaches to count.
     * @example
     * // Count the number of TransactionCaches
     * const count = await prisma.transactionCache.count({
     *   where: {
     *     // ... the filter for the TransactionCaches we want to count
     *   }
     * })
    **/
    count<T extends TransactionCacheCountArgs>(
      args?: Subset<T, TransactionCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TransactionCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionCacheAggregateArgs>(args: Subset<T, TransactionCacheAggregateArgs>): Prisma.PrismaPromise<GetTransactionCacheAggregateType<T>>

    /**
     * Group by TransactionCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionCacheGroupByArgs['orderBy'] }
        : { orderBy?: TransactionCacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TransactionCache model
   */
  readonly fields: TransactionCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TransactionCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TransactionCache model
   */
  interface TransactionCacheFieldRefs {
    readonly rawTextHash: FieldRef<"TransactionCache", 'String'>
    readonly rawText: FieldRef<"TransactionCache", 'String'>
    readonly uniqueKey: FieldRef<"TransactionCache", 'String'>
    readonly createdAt: FieldRef<"TransactionCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TransactionCache findUnique
   */
  export type TransactionCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter, which TransactionCache to fetch.
     */
    where: TransactionCacheWhereUniqueInput
  }

  /**
   * TransactionCache findUniqueOrThrow
   */
  export type TransactionCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter, which TransactionCache to fetch.
     */
    where: TransactionCacheWhereUniqueInput
  }

  /**
   * TransactionCache findFirst
   */
  export type TransactionCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter, which TransactionCache to fetch.
     */
    where?: TransactionCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionCaches to fetch.
     */
    orderBy?: TransactionCacheOrderByWithRelationInput | TransactionCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionCaches.
     */
    cursor?: TransactionCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionCaches.
     */
    distinct?: TransactionCacheScalarFieldEnum | TransactionCacheScalarFieldEnum[]
  }

  /**
   * TransactionCache findFirstOrThrow
   */
  export type TransactionCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter, which TransactionCache to fetch.
     */
    where?: TransactionCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionCaches to fetch.
     */
    orderBy?: TransactionCacheOrderByWithRelationInput | TransactionCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionCaches.
     */
    cursor?: TransactionCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionCaches.
     */
    distinct?: TransactionCacheScalarFieldEnum | TransactionCacheScalarFieldEnum[]
  }

  /**
   * TransactionCache findMany
   */
  export type TransactionCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter, which TransactionCaches to fetch.
     */
    where?: TransactionCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionCaches to fetch.
     */
    orderBy?: TransactionCacheOrderByWithRelationInput | TransactionCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TransactionCaches.
     */
    cursor?: TransactionCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionCaches.
     */
    skip?: number
    distinct?: TransactionCacheScalarFieldEnum | TransactionCacheScalarFieldEnum[]
  }

  /**
   * TransactionCache create
   */
  export type TransactionCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * The data needed to create a TransactionCache.
     */
    data: XOR<TransactionCacheCreateInput, TransactionCacheUncheckedCreateInput>
  }

  /**
   * TransactionCache createMany
   */
  export type TransactionCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TransactionCaches.
     */
    data: TransactionCacheCreateManyInput | TransactionCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransactionCache createManyAndReturn
   */
  export type TransactionCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * The data used to create many TransactionCaches.
     */
    data: TransactionCacheCreateManyInput | TransactionCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransactionCache update
   */
  export type TransactionCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * The data needed to update a TransactionCache.
     */
    data: XOR<TransactionCacheUpdateInput, TransactionCacheUncheckedUpdateInput>
    /**
     * Choose, which TransactionCache to update.
     */
    where: TransactionCacheWhereUniqueInput
  }

  /**
   * TransactionCache updateMany
   */
  export type TransactionCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TransactionCaches.
     */
    data: XOR<TransactionCacheUpdateManyMutationInput, TransactionCacheUncheckedUpdateManyInput>
    /**
     * Filter which TransactionCaches to update
     */
    where?: TransactionCacheWhereInput
    /**
     * Limit how many TransactionCaches to update.
     */
    limit?: number
  }

  /**
   * TransactionCache updateManyAndReturn
   */
  export type TransactionCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * The data used to update TransactionCaches.
     */
    data: XOR<TransactionCacheUpdateManyMutationInput, TransactionCacheUncheckedUpdateManyInput>
    /**
     * Filter which TransactionCaches to update
     */
    where?: TransactionCacheWhereInput
    /**
     * Limit how many TransactionCaches to update.
     */
    limit?: number
  }

  /**
   * TransactionCache upsert
   */
  export type TransactionCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * The filter to search for the TransactionCache to update in case it exists.
     */
    where: TransactionCacheWhereUniqueInput
    /**
     * In case the TransactionCache found by the `where` argument doesn't exist, create a new TransactionCache with this data.
     */
    create: XOR<TransactionCacheCreateInput, TransactionCacheUncheckedCreateInput>
    /**
     * In case the TransactionCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionCacheUpdateInput, TransactionCacheUncheckedUpdateInput>
  }

  /**
   * TransactionCache delete
   */
  export type TransactionCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
    /**
     * Filter which TransactionCache to delete.
     */
    where: TransactionCacheWhereUniqueInput
  }

  /**
   * TransactionCache deleteMany
   */
  export type TransactionCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionCaches to delete
     */
    where?: TransactionCacheWhereInput
    /**
     * Limit how many TransactionCaches to delete.
     */
    limit?: number
  }

  /**
   * TransactionCache without action
   */
  export type TransactionCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCache
     */
    select?: TransactionCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionCache
     */
    omit?: TransactionCacheOmit<ExtArgs> | null
  }


  /**
   * Model Rule
   */

  export type AggregateRule = {
    _count: RuleCountAggregateOutputType | null
    _avg: RuleAvgAggregateOutputType | null
    _sum: RuleSumAggregateOutputType | null
    _min: RuleMinAggregateOutputType | null
    _max: RuleMaxAggregateOutputType | null
  }

  export type RuleAvgAggregateOutputType = {
    id: number | null
    priority: number | null
  }

  export type RuleSumAggregateOutputType = {
    id: number | null
    priority: number | null
  }

  export type RuleMinAggregateOutputType = {
    id: number | null
    companyId: string | null
    uniqueKey: string | null
    targetDebitAccount: string | null
    targetCreditAccount: string | null
    targetSuggestedTag: string | null
    vatApplicable: boolean | null
    priority: number | null
    isActive: boolean | null
    createdAt: Date | null
    createdBy: $Enums.RuleCreator | null
  }

  export type RuleMaxAggregateOutputType = {
    id: number | null
    companyId: string | null
    uniqueKey: string | null
    targetDebitAccount: string | null
    targetCreditAccount: string | null
    targetSuggestedTag: string | null
    vatApplicable: boolean | null
    priority: number | null
    isActive: boolean | null
    createdAt: Date | null
    createdBy: $Enums.RuleCreator | null
  }

  export type RuleCountAggregateOutputType = {
    id: number
    companyId: number
    uniqueKey: number
    targetDebitAccount: number
    targetCreditAccount: number
    targetSuggestedTag: number
    vatApplicable: number
    priority: number
    isActive: number
    createdAt: number
    createdBy: number
    _all: number
  }


  export type RuleAvgAggregateInputType = {
    id?: true
    priority?: true
  }

  export type RuleSumAggregateInputType = {
    id?: true
    priority?: true
  }

  export type RuleMinAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetCreditAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    priority?: true
    isActive?: true
    createdAt?: true
    createdBy?: true
  }

  export type RuleMaxAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetCreditAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    priority?: true
    isActive?: true
    createdAt?: true
    createdBy?: true
  }

  export type RuleCountAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetCreditAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    priority?: true
    isActive?: true
    createdAt?: true
    createdBy?: true
    _all?: true
  }

  export type RuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rule to aggregate.
     */
    where?: RuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rules to fetch.
     */
    orderBy?: RuleOrderByWithRelationInput | RuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rules
    **/
    _count?: true | RuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RuleMaxAggregateInputType
  }

  export type GetRuleAggregateType<T extends RuleAggregateArgs> = {
        [P in keyof T & keyof AggregateRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRule[P]>
      : GetScalarType<T[P], AggregateRule[P]>
  }




  export type RuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleWhereInput
    orderBy?: RuleOrderByWithAggregationInput | RuleOrderByWithAggregationInput[]
    by: RuleScalarFieldEnum[] | RuleScalarFieldEnum
    having?: RuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RuleCountAggregateInputType | true
    _avg?: RuleAvgAggregateInputType
    _sum?: RuleSumAggregateInputType
    _min?: RuleMinAggregateInputType
    _max?: RuleMaxAggregateInputType
  }

  export type RuleGroupByOutputType = {
    id: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount: string
    targetSuggestedTag: string | null
    vatApplicable: boolean
    priority: number
    isActive: boolean
    createdAt: Date
    createdBy: $Enums.RuleCreator
    _count: RuleCountAggregateOutputType | null
    _avg: RuleAvgAggregateOutputType | null
    _sum: RuleSumAggregateOutputType | null
    _min: RuleMinAggregateOutputType | null
    _max: RuleMaxAggregateOutputType | null
  }

  type GetRuleGroupByPayload<T extends RuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleGroupByOutputType[P]>
            : GetScalarType<T[P], RuleGroupByOutputType[P]>
        }
      >
    >


  export type RuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetCreditAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rule"]>

  export type RuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetCreditAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rule"]>

  export type RuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetCreditAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rule"]>

  export type RuleSelectScalar = {
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetCreditAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
  }

  export type RuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "companyId" | "uniqueKey" | "targetDebitAccount" | "targetCreditAccount" | "targetSuggestedTag" | "vatApplicable" | "priority" | "isActive" | "createdAt" | "createdBy", ExtArgs["result"]["rule"]>
  export type RuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type RuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type RuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $RulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Rule"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      companyId: string
      uniqueKey: string
      targetDebitAccount: string
      targetCreditAccount: string
      targetSuggestedTag: string | null
      vatApplicable: boolean
      priority: number
      isActive: boolean
      createdAt: Date
      createdBy: $Enums.RuleCreator
    }, ExtArgs["result"]["rule"]>
    composites: {}
  }

  type RuleGetPayload<S extends boolean | null | undefined | RuleDefaultArgs> = $Result.GetResult<Prisma.$RulePayload, S>

  type RuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RuleCountAggregateInputType | true
    }

  export interface RuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Rule'], meta: { name: 'Rule' } }
    /**
     * Find zero or one Rule that matches the filter.
     * @param {RuleFindUniqueArgs} args - Arguments to find a Rule
     * @example
     * // Get one Rule
     * const rule = await prisma.rule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleFindUniqueArgs>(args: SelectSubset<T, RuleFindUniqueArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Rule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleFindUniqueOrThrowArgs} args - Arguments to find a Rule
     * @example
     * // Get one Rule
     * const rule = await prisma.rule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleFindUniqueOrThrowArgs>(args: SelectSubset<T, RuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleFindFirstArgs} args - Arguments to find a Rule
     * @example
     * // Get one Rule
     * const rule = await prisma.rule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleFindFirstArgs>(args?: SelectSubset<T, RuleFindFirstArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleFindFirstOrThrowArgs} args - Arguments to find a Rule
     * @example
     * // Get one Rule
     * const rule = await prisma.rule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleFindFirstOrThrowArgs>(args?: SelectSubset<T, RuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rules
     * const rules = await prisma.rule.findMany()
     * 
     * // Get first 10 Rules
     * const rules = await prisma.rule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ruleWithIdOnly = await prisma.rule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RuleFindManyArgs>(args?: SelectSubset<T, RuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Rule.
     * @param {RuleCreateArgs} args - Arguments to create a Rule.
     * @example
     * // Create one Rule
     * const Rule = await prisma.rule.create({
     *   data: {
     *     // ... data to create a Rule
     *   }
     * })
     * 
     */
    create<T extends RuleCreateArgs>(args: SelectSubset<T, RuleCreateArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rules.
     * @param {RuleCreateManyArgs} args - Arguments to create many Rules.
     * @example
     * // Create many Rules
     * const rule = await prisma.rule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RuleCreateManyArgs>(args?: SelectSubset<T, RuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rules and returns the data saved in the database.
     * @param {RuleCreateManyAndReturnArgs} args - Arguments to create many Rules.
     * @example
     * // Create many Rules
     * const rule = await prisma.rule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rules and only return the `id`
     * const ruleWithIdOnly = await prisma.rule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RuleCreateManyAndReturnArgs>(args?: SelectSubset<T, RuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Rule.
     * @param {RuleDeleteArgs} args - Arguments to delete one Rule.
     * @example
     * // Delete one Rule
     * const Rule = await prisma.rule.delete({
     *   where: {
     *     // ... filter to delete one Rule
     *   }
     * })
     * 
     */
    delete<T extends RuleDeleteArgs>(args: SelectSubset<T, RuleDeleteArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Rule.
     * @param {RuleUpdateArgs} args - Arguments to update one Rule.
     * @example
     * // Update one Rule
     * const rule = await prisma.rule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RuleUpdateArgs>(args: SelectSubset<T, RuleUpdateArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rules.
     * @param {RuleDeleteManyArgs} args - Arguments to filter Rules to delete.
     * @example
     * // Delete a few Rules
     * const { count } = await prisma.rule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RuleDeleteManyArgs>(args?: SelectSubset<T, RuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rules
     * const rule = await prisma.rule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RuleUpdateManyArgs>(args: SelectSubset<T, RuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rules and returns the data updated in the database.
     * @param {RuleUpdateManyAndReturnArgs} args - Arguments to update many Rules.
     * @example
     * // Update many Rules
     * const rule = await prisma.rule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rules and only return the `id`
     * const ruleWithIdOnly = await prisma.rule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RuleUpdateManyAndReturnArgs>(args: SelectSubset<T, RuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Rule.
     * @param {RuleUpsertArgs} args - Arguments to update or create a Rule.
     * @example
     * // Update or create a Rule
     * const rule = await prisma.rule.upsert({
     *   create: {
     *     // ... data to create a Rule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Rule we want to update
     *   }
     * })
     */
    upsert<T extends RuleUpsertArgs>(args: SelectSubset<T, RuleUpsertArgs<ExtArgs>>): Prisma__RuleClient<$Result.GetResult<Prisma.$RulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCountArgs} args - Arguments to filter Rules to count.
     * @example
     * // Count the number of Rules
     * const count = await prisma.rule.count({
     *   where: {
     *     // ... the filter for the Rules we want to count
     *   }
     * })
    **/
    count<T extends RuleCountArgs>(
      args?: Subset<T, RuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Rule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RuleAggregateArgs>(args: Subset<T, RuleAggregateArgs>): Prisma.PrismaPromise<GetRuleAggregateType<T>>

    /**
     * Group by Rule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleGroupByArgs['orderBy'] }
        : { orderBy?: RuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Rule model
   */
  readonly fields: RuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Rule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Rule model
   */
  interface RuleFieldRefs {
    readonly id: FieldRef<"Rule", 'Int'>
    readonly companyId: FieldRef<"Rule", 'String'>
    readonly uniqueKey: FieldRef<"Rule", 'String'>
    readonly targetDebitAccount: FieldRef<"Rule", 'String'>
    readonly targetCreditAccount: FieldRef<"Rule", 'String'>
    readonly targetSuggestedTag: FieldRef<"Rule", 'String'>
    readonly vatApplicable: FieldRef<"Rule", 'Boolean'>
    readonly priority: FieldRef<"Rule", 'Int'>
    readonly isActive: FieldRef<"Rule", 'Boolean'>
    readonly createdAt: FieldRef<"Rule", 'DateTime'>
    readonly createdBy: FieldRef<"Rule", 'RuleCreator'>
  }
    

  // Custom InputTypes
  /**
   * Rule findUnique
   */
  export type RuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter, which Rule to fetch.
     */
    where: RuleWhereUniqueInput
  }

  /**
   * Rule findUniqueOrThrow
   */
  export type RuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter, which Rule to fetch.
     */
    where: RuleWhereUniqueInput
  }

  /**
   * Rule findFirst
   */
  export type RuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter, which Rule to fetch.
     */
    where?: RuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rules to fetch.
     */
    orderBy?: RuleOrderByWithRelationInput | RuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rules.
     */
    cursor?: RuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rules.
     */
    distinct?: RuleScalarFieldEnum | RuleScalarFieldEnum[]
  }

  /**
   * Rule findFirstOrThrow
   */
  export type RuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter, which Rule to fetch.
     */
    where?: RuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rules to fetch.
     */
    orderBy?: RuleOrderByWithRelationInput | RuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rules.
     */
    cursor?: RuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rules.
     */
    distinct?: RuleScalarFieldEnum | RuleScalarFieldEnum[]
  }

  /**
   * Rule findMany
   */
  export type RuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter, which Rules to fetch.
     */
    where?: RuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rules to fetch.
     */
    orderBy?: RuleOrderByWithRelationInput | RuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rules.
     */
    cursor?: RuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rules.
     */
    skip?: number
    distinct?: RuleScalarFieldEnum | RuleScalarFieldEnum[]
  }

  /**
   * Rule create
   */
  export type RuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * The data needed to create a Rule.
     */
    data: XOR<RuleCreateInput, RuleUncheckedCreateInput>
  }

  /**
   * Rule createMany
   */
  export type RuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rules.
     */
    data: RuleCreateManyInput | RuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Rule createManyAndReturn
   */
  export type RuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * The data used to create many Rules.
     */
    data: RuleCreateManyInput | RuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Rule update
   */
  export type RuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * The data needed to update a Rule.
     */
    data: XOR<RuleUpdateInput, RuleUncheckedUpdateInput>
    /**
     * Choose, which Rule to update.
     */
    where: RuleWhereUniqueInput
  }

  /**
   * Rule updateMany
   */
  export type RuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rules.
     */
    data: XOR<RuleUpdateManyMutationInput, RuleUncheckedUpdateManyInput>
    /**
     * Filter which Rules to update
     */
    where?: RuleWhereInput
    /**
     * Limit how many Rules to update.
     */
    limit?: number
  }

  /**
   * Rule updateManyAndReturn
   */
  export type RuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * The data used to update Rules.
     */
    data: XOR<RuleUpdateManyMutationInput, RuleUncheckedUpdateManyInput>
    /**
     * Filter which Rules to update
     */
    where?: RuleWhereInput
    /**
     * Limit how many Rules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Rule upsert
   */
  export type RuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * The filter to search for the Rule to update in case it exists.
     */
    where: RuleWhereUniqueInput
    /**
     * In case the Rule found by the `where` argument doesn't exist, create a new Rule with this data.
     */
    create: XOR<RuleCreateInput, RuleUncheckedCreateInput>
    /**
     * In case the Rule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleUpdateInput, RuleUncheckedUpdateInput>
  }

  /**
   * Rule delete
   */
  export type RuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
    /**
     * Filter which Rule to delete.
     */
    where: RuleWhereUniqueInput
  }

  /**
   * Rule deleteMany
   */
  export type RuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rules to delete
     */
    where?: RuleWhereInput
    /**
     * Limit how many Rules to delete.
     */
    limit?: number
  }

  /**
   * Rule without action
   */
  export type RuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rule
     */
    select?: RuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rule
     */
    omit?: RuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleInclude<ExtArgs> | null
  }


  /**
   * Model RuleCandidate
   */

  export type AggregateRuleCandidate = {
    _count: RuleCandidateCountAggregateOutputType | null
    _avg: RuleCandidateAvgAggregateOutputType | null
    _sum: RuleCandidateSumAggregateOutputType | null
    _min: RuleCandidateMinAggregateOutputType | null
    _max: RuleCandidateMaxAggregateOutputType | null
  }

  export type RuleCandidateAvgAggregateOutputType = {
    id: number | null
    suggestionCount: number | null
  }

  export type RuleCandidateSumAggregateOutputType = {
    id: number | null
    suggestionCount: number | null
  }

  export type RuleCandidateMinAggregateOutputType = {
    id: number | null
    companyId: string | null
    uniqueKey: string | null
    targetDebitAccount: string | null
    targetSuggestedTag: string | null
    vatApplicable: boolean | null
    suggestionCount: number | null
    lastSuggestedAt: Date | null
  }

  export type RuleCandidateMaxAggregateOutputType = {
    id: number | null
    companyId: string | null
    uniqueKey: string | null
    targetDebitAccount: string | null
    targetSuggestedTag: string | null
    vatApplicable: boolean | null
    suggestionCount: number | null
    lastSuggestedAt: Date | null
  }

  export type RuleCandidateCountAggregateOutputType = {
    id: number
    companyId: number
    uniqueKey: number
    targetDebitAccount: number
    targetSuggestedTag: number
    vatApplicable: number
    suggestionCount: number
    lastSuggestedAt: number
    _all: number
  }


  export type RuleCandidateAvgAggregateInputType = {
    id?: true
    suggestionCount?: true
  }

  export type RuleCandidateSumAggregateInputType = {
    id?: true
    suggestionCount?: true
  }

  export type RuleCandidateMinAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    suggestionCount?: true
    lastSuggestedAt?: true
  }

  export type RuleCandidateMaxAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    suggestionCount?: true
    lastSuggestedAt?: true
  }

  export type RuleCandidateCountAggregateInputType = {
    id?: true
    companyId?: true
    uniqueKey?: true
    targetDebitAccount?: true
    targetSuggestedTag?: true
    vatApplicable?: true
    suggestionCount?: true
    lastSuggestedAt?: true
    _all?: true
  }

  export type RuleCandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleCandidate to aggregate.
     */
    where?: RuleCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleCandidates to fetch.
     */
    orderBy?: RuleCandidateOrderByWithRelationInput | RuleCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RuleCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RuleCandidates
    **/
    _count?: true | RuleCandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RuleCandidateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RuleCandidateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RuleCandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RuleCandidateMaxAggregateInputType
  }

  export type GetRuleCandidateAggregateType<T extends RuleCandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateRuleCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRuleCandidate[P]>
      : GetScalarType<T[P], AggregateRuleCandidate[P]>
  }




  export type RuleCandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleCandidateWhereInput
    orderBy?: RuleCandidateOrderByWithAggregationInput | RuleCandidateOrderByWithAggregationInput[]
    by: RuleCandidateScalarFieldEnum[] | RuleCandidateScalarFieldEnum
    having?: RuleCandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RuleCandidateCountAggregateInputType | true
    _avg?: RuleCandidateAvgAggregateInputType
    _sum?: RuleCandidateSumAggregateInputType
    _min?: RuleCandidateMinAggregateInputType
    _max?: RuleCandidateMaxAggregateInputType
  }

  export type RuleCandidateGroupByOutputType = {
    id: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag: string | null
    vatApplicable: boolean | null
    suggestionCount: number
    lastSuggestedAt: Date
    _count: RuleCandidateCountAggregateOutputType | null
    _avg: RuleCandidateAvgAggregateOutputType | null
    _sum: RuleCandidateSumAggregateOutputType | null
    _min: RuleCandidateMinAggregateOutputType | null
    _max: RuleCandidateMaxAggregateOutputType | null
  }

  type GetRuleCandidateGroupByPayload<T extends RuleCandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RuleCandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RuleCandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleCandidateGroupByOutputType[P]>
            : GetScalarType<T[P], RuleCandidateGroupByOutputType[P]>
        }
      >
    >


  export type RuleCandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    suggestionCount?: boolean
    lastSuggestedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ruleCandidate"]>

  export type RuleCandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    suggestionCount?: boolean
    lastSuggestedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ruleCandidate"]>

  export type RuleCandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    suggestionCount?: boolean
    lastSuggestedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ruleCandidate"]>

  export type RuleCandidateSelectScalar = {
    id?: boolean
    companyId?: boolean
    uniqueKey?: boolean
    targetDebitAccount?: boolean
    targetSuggestedTag?: boolean
    vatApplicable?: boolean
    suggestionCount?: boolean
    lastSuggestedAt?: boolean
  }

  export type RuleCandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "companyId" | "uniqueKey" | "targetDebitAccount" | "targetSuggestedTag" | "vatApplicable" | "suggestionCount" | "lastSuggestedAt", ExtArgs["result"]["ruleCandidate"]>
  export type RuleCandidateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type RuleCandidateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type RuleCandidateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $RuleCandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RuleCandidate"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      companyId: string
      uniqueKey: string
      targetDebitAccount: string
      targetSuggestedTag: string | null
      vatApplicable: boolean | null
      suggestionCount: number
      lastSuggestedAt: Date
    }, ExtArgs["result"]["ruleCandidate"]>
    composites: {}
  }

  type RuleCandidateGetPayload<S extends boolean | null | undefined | RuleCandidateDefaultArgs> = $Result.GetResult<Prisma.$RuleCandidatePayload, S>

  type RuleCandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RuleCandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RuleCandidateCountAggregateInputType | true
    }

  export interface RuleCandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RuleCandidate'], meta: { name: 'RuleCandidate' } }
    /**
     * Find zero or one RuleCandidate that matches the filter.
     * @param {RuleCandidateFindUniqueArgs} args - Arguments to find a RuleCandidate
     * @example
     * // Get one RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleCandidateFindUniqueArgs>(args: SelectSubset<T, RuleCandidateFindUniqueArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RuleCandidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleCandidateFindUniqueOrThrowArgs} args - Arguments to find a RuleCandidate
     * @example
     * // Get one RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleCandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, RuleCandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleCandidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateFindFirstArgs} args - Arguments to find a RuleCandidate
     * @example
     * // Get one RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleCandidateFindFirstArgs>(args?: SelectSubset<T, RuleCandidateFindFirstArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleCandidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateFindFirstOrThrowArgs} args - Arguments to find a RuleCandidate
     * @example
     * // Get one RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleCandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, RuleCandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RuleCandidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RuleCandidates
     * const ruleCandidates = await prisma.ruleCandidate.findMany()
     * 
     * // Get first 10 RuleCandidates
     * const ruleCandidates = await prisma.ruleCandidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ruleCandidateWithIdOnly = await prisma.ruleCandidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RuleCandidateFindManyArgs>(args?: SelectSubset<T, RuleCandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RuleCandidate.
     * @param {RuleCandidateCreateArgs} args - Arguments to create a RuleCandidate.
     * @example
     * // Create one RuleCandidate
     * const RuleCandidate = await prisma.ruleCandidate.create({
     *   data: {
     *     // ... data to create a RuleCandidate
     *   }
     * })
     * 
     */
    create<T extends RuleCandidateCreateArgs>(args: SelectSubset<T, RuleCandidateCreateArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RuleCandidates.
     * @param {RuleCandidateCreateManyArgs} args - Arguments to create many RuleCandidates.
     * @example
     * // Create many RuleCandidates
     * const ruleCandidate = await prisma.ruleCandidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RuleCandidateCreateManyArgs>(args?: SelectSubset<T, RuleCandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RuleCandidates and returns the data saved in the database.
     * @param {RuleCandidateCreateManyAndReturnArgs} args - Arguments to create many RuleCandidates.
     * @example
     * // Create many RuleCandidates
     * const ruleCandidate = await prisma.ruleCandidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RuleCandidates and only return the `id`
     * const ruleCandidateWithIdOnly = await prisma.ruleCandidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RuleCandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, RuleCandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RuleCandidate.
     * @param {RuleCandidateDeleteArgs} args - Arguments to delete one RuleCandidate.
     * @example
     * // Delete one RuleCandidate
     * const RuleCandidate = await prisma.ruleCandidate.delete({
     *   where: {
     *     // ... filter to delete one RuleCandidate
     *   }
     * })
     * 
     */
    delete<T extends RuleCandidateDeleteArgs>(args: SelectSubset<T, RuleCandidateDeleteArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RuleCandidate.
     * @param {RuleCandidateUpdateArgs} args - Arguments to update one RuleCandidate.
     * @example
     * // Update one RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RuleCandidateUpdateArgs>(args: SelectSubset<T, RuleCandidateUpdateArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RuleCandidates.
     * @param {RuleCandidateDeleteManyArgs} args - Arguments to filter RuleCandidates to delete.
     * @example
     * // Delete a few RuleCandidates
     * const { count } = await prisma.ruleCandidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RuleCandidateDeleteManyArgs>(args?: SelectSubset<T, RuleCandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RuleCandidates
     * const ruleCandidate = await prisma.ruleCandidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RuleCandidateUpdateManyArgs>(args: SelectSubset<T, RuleCandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleCandidates and returns the data updated in the database.
     * @param {RuleCandidateUpdateManyAndReturnArgs} args - Arguments to update many RuleCandidates.
     * @example
     * // Update many RuleCandidates
     * const ruleCandidate = await prisma.ruleCandidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RuleCandidates and only return the `id`
     * const ruleCandidateWithIdOnly = await prisma.ruleCandidate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RuleCandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, RuleCandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RuleCandidate.
     * @param {RuleCandidateUpsertArgs} args - Arguments to update or create a RuleCandidate.
     * @example
     * // Update or create a RuleCandidate
     * const ruleCandidate = await prisma.ruleCandidate.upsert({
     *   create: {
     *     // ... data to create a RuleCandidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RuleCandidate we want to update
     *   }
     * })
     */
    upsert<T extends RuleCandidateUpsertArgs>(args: SelectSubset<T, RuleCandidateUpsertArgs<ExtArgs>>): Prisma__RuleCandidateClient<$Result.GetResult<Prisma.$RuleCandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RuleCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateCountArgs} args - Arguments to filter RuleCandidates to count.
     * @example
     * // Count the number of RuleCandidates
     * const count = await prisma.ruleCandidate.count({
     *   where: {
     *     // ... the filter for the RuleCandidates we want to count
     *   }
     * })
    **/
    count<T extends RuleCandidateCountArgs>(
      args?: Subset<T, RuleCandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleCandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RuleCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RuleCandidateAggregateArgs>(args: Subset<T, RuleCandidateAggregateArgs>): Prisma.PrismaPromise<GetRuleCandidateAggregateType<T>>

    /**
     * Group by RuleCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleCandidateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RuleCandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleCandidateGroupByArgs['orderBy'] }
        : { orderBy?: RuleCandidateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RuleCandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRuleCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RuleCandidate model
   */
  readonly fields: RuleCandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RuleCandidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleCandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RuleCandidate model
   */
  interface RuleCandidateFieldRefs {
    readonly id: FieldRef<"RuleCandidate", 'Int'>
    readonly companyId: FieldRef<"RuleCandidate", 'String'>
    readonly uniqueKey: FieldRef<"RuleCandidate", 'String'>
    readonly targetDebitAccount: FieldRef<"RuleCandidate", 'String'>
    readonly targetSuggestedTag: FieldRef<"RuleCandidate", 'String'>
    readonly vatApplicable: FieldRef<"RuleCandidate", 'Boolean'>
    readonly suggestionCount: FieldRef<"RuleCandidate", 'Int'>
    readonly lastSuggestedAt: FieldRef<"RuleCandidate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RuleCandidate findUnique
   */
  export type RuleCandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RuleCandidate to fetch.
     */
    where: RuleCandidateWhereUniqueInput
  }

  /**
   * RuleCandidate findUniqueOrThrow
   */
  export type RuleCandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RuleCandidate to fetch.
     */
    where: RuleCandidateWhereUniqueInput
  }

  /**
   * RuleCandidate findFirst
   */
  export type RuleCandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RuleCandidate to fetch.
     */
    where?: RuleCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleCandidates to fetch.
     */
    orderBy?: RuleCandidateOrderByWithRelationInput | RuleCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleCandidates.
     */
    cursor?: RuleCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleCandidates.
     */
    distinct?: RuleCandidateScalarFieldEnum | RuleCandidateScalarFieldEnum[]
  }

  /**
   * RuleCandidate findFirstOrThrow
   */
  export type RuleCandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RuleCandidate to fetch.
     */
    where?: RuleCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleCandidates to fetch.
     */
    orderBy?: RuleCandidateOrderByWithRelationInput | RuleCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleCandidates.
     */
    cursor?: RuleCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleCandidates.
     */
    distinct?: RuleCandidateScalarFieldEnum | RuleCandidateScalarFieldEnum[]
  }

  /**
   * RuleCandidate findMany
   */
  export type RuleCandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RuleCandidates to fetch.
     */
    where?: RuleCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleCandidates to fetch.
     */
    orderBy?: RuleCandidateOrderByWithRelationInput | RuleCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RuleCandidates.
     */
    cursor?: RuleCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleCandidates.
     */
    skip?: number
    distinct?: RuleCandidateScalarFieldEnum | RuleCandidateScalarFieldEnum[]
  }

  /**
   * RuleCandidate create
   */
  export type RuleCandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * The data needed to create a RuleCandidate.
     */
    data: XOR<RuleCandidateCreateInput, RuleCandidateUncheckedCreateInput>
  }

  /**
   * RuleCandidate createMany
   */
  export type RuleCandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RuleCandidates.
     */
    data: RuleCandidateCreateManyInput | RuleCandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleCandidate createManyAndReturn
   */
  export type RuleCandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * The data used to create many RuleCandidates.
     */
    data: RuleCandidateCreateManyInput | RuleCandidateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RuleCandidate update
   */
  export type RuleCandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * The data needed to update a RuleCandidate.
     */
    data: XOR<RuleCandidateUpdateInput, RuleCandidateUncheckedUpdateInput>
    /**
     * Choose, which RuleCandidate to update.
     */
    where: RuleCandidateWhereUniqueInput
  }

  /**
   * RuleCandidate updateMany
   */
  export type RuleCandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RuleCandidates.
     */
    data: XOR<RuleCandidateUpdateManyMutationInput, RuleCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RuleCandidates to update
     */
    where?: RuleCandidateWhereInput
    /**
     * Limit how many RuleCandidates to update.
     */
    limit?: number
  }

  /**
   * RuleCandidate updateManyAndReturn
   */
  export type RuleCandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * The data used to update RuleCandidates.
     */
    data: XOR<RuleCandidateUpdateManyMutationInput, RuleCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RuleCandidates to update
     */
    where?: RuleCandidateWhereInput
    /**
     * Limit how many RuleCandidates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RuleCandidate upsert
   */
  export type RuleCandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * The filter to search for the RuleCandidate to update in case it exists.
     */
    where: RuleCandidateWhereUniqueInput
    /**
     * In case the RuleCandidate found by the `where` argument doesn't exist, create a new RuleCandidate with this data.
     */
    create: XOR<RuleCandidateCreateInput, RuleCandidateUncheckedCreateInput>
    /**
     * In case the RuleCandidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleCandidateUpdateInput, RuleCandidateUncheckedUpdateInput>
  }

  /**
   * RuleCandidate delete
   */
  export type RuleCandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
    /**
     * Filter which RuleCandidate to delete.
     */
    where: RuleCandidateWhereUniqueInput
  }

  /**
   * RuleCandidate deleteMany
   */
  export type RuleCandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleCandidates to delete
     */
    where?: RuleCandidateWhereInput
    /**
     * Limit how many RuleCandidates to delete.
     */
    limit?: number
  }

  /**
   * RuleCandidate without action
   */
  export type RuleCandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleCandidate
     */
    select?: RuleCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleCandidate
     */
    omit?: RuleCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleCandidateInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    id: number | null
    amount: number | null
    anomalyScore: Decimal | null
  }

  export type TransactionSumAggregateOutputType = {
    id: bigint | null
    amount: bigint | null
    anomalyScore: Decimal | null
  }

  export type TransactionMinAggregateOutputType = {
    id: bigint | null
    companyId: string | null
    rawText: string | null
    transactionDate: Date | null
    amount: bigint | null
    normalizedUniqueKey: string | null
    isAnomaly: boolean | null
    anomalyScore: Decimal | null
    finalDebitAccount: string | null
    finalCreditAccount: string | null
    finalSuggestedTag: string | null
    createdAt: Date | null
    updatedAt: Date | null
    transactionType: $Enums.TransactionIOType | null
    status: $Enums.TransactionStatus | null
    processedBy: $Enums.ProcessorType | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: bigint | null
    companyId: string | null
    rawText: string | null
    transactionDate: Date | null
    amount: bigint | null
    normalizedUniqueKey: string | null
    isAnomaly: boolean | null
    anomalyScore: Decimal | null
    finalDebitAccount: string | null
    finalCreditAccount: string | null
    finalSuggestedTag: string | null
    createdAt: Date | null
    updatedAt: Date | null
    transactionType: $Enums.TransactionIOType | null
    status: $Enums.TransactionStatus | null
    processedBy: $Enums.ProcessorType | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    companyId: number
    rawText: number
    transactionDate: number
    amount: number
    normalizedUniqueKey: number
    isAnomaly: number
    anomalyScore: number
    llmResponse: number
    userClarification: number
    finalDebitAccount: number
    finalCreditAccount: number
    finalSuggestedTag: number
    createdAt: number
    updatedAt: number
    transactionType: number
    status: number
    processedBy: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    id?: true
    amount?: true
    anomalyScore?: true
  }

  export type TransactionSumAggregateInputType = {
    id?: true
    amount?: true
    anomalyScore?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    companyId?: true
    rawText?: true
    transactionDate?: true
    amount?: true
    normalizedUniqueKey?: true
    isAnomaly?: true
    anomalyScore?: true
    finalDebitAccount?: true
    finalCreditAccount?: true
    finalSuggestedTag?: true
    createdAt?: true
    updatedAt?: true
    transactionType?: true
    status?: true
    processedBy?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    companyId?: true
    rawText?: true
    transactionDate?: true
    amount?: true
    normalizedUniqueKey?: true
    isAnomaly?: true
    anomalyScore?: true
    finalDebitAccount?: true
    finalCreditAccount?: true
    finalSuggestedTag?: true
    createdAt?: true
    updatedAt?: true
    transactionType?: true
    status?: true
    processedBy?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    companyId?: true
    rawText?: true
    transactionDate?: true
    amount?: true
    normalizedUniqueKey?: true
    isAnomaly?: true
    anomalyScore?: true
    llmResponse?: true
    userClarification?: true
    finalDebitAccount?: true
    finalCreditAccount?: true
    finalSuggestedTag?: true
    createdAt?: true
    updatedAt?: true
    transactionType?: true
    status?: true
    processedBy?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: bigint
    companyId: string
    rawText: string
    transactionDate: Date
    amount: bigint
    normalizedUniqueKey: string | null
    isAnomaly: boolean
    anomalyScore: Decimal | null
    llmResponse: JsonValue | null
    userClarification: JsonValue | null
    finalDebitAccount: string | null
    finalCreditAccount: string | null
    finalSuggestedTag: string | null
    createdAt: Date
    updatedAt: Date
    transactionType: $Enums.TransactionIOType
    status: $Enums.TransactionStatus
    processedBy: $Enums.ProcessorType | null
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    rawText?: boolean
    transactionDate?: boolean
    amount?: boolean
    normalizedUniqueKey?: boolean
    isAnomaly?: boolean
    anomalyScore?: boolean
    llmResponse?: boolean
    userClarification?: boolean
    finalDebitAccount?: boolean
    finalCreditAccount?: boolean
    finalSuggestedTag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionType?: boolean
    status?: boolean
    processedBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    rawText?: boolean
    transactionDate?: boolean
    amount?: boolean
    normalizedUniqueKey?: boolean
    isAnomaly?: boolean
    anomalyScore?: boolean
    llmResponse?: boolean
    userClarification?: boolean
    finalDebitAccount?: boolean
    finalCreditAccount?: boolean
    finalSuggestedTag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionType?: boolean
    status?: boolean
    processedBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    rawText?: boolean
    transactionDate?: boolean
    amount?: boolean
    normalizedUniqueKey?: boolean
    isAnomaly?: boolean
    anomalyScore?: boolean
    llmResponse?: boolean
    userClarification?: boolean
    finalDebitAccount?: boolean
    finalCreditAccount?: boolean
    finalSuggestedTag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionType?: boolean
    status?: boolean
    processedBy?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    companyId?: boolean
    rawText?: boolean
    transactionDate?: boolean
    amount?: boolean
    normalizedUniqueKey?: boolean
    isAnomaly?: boolean
    anomalyScore?: boolean
    llmResponse?: boolean
    userClarification?: boolean
    finalDebitAccount?: boolean
    finalCreditAccount?: boolean
    finalSuggestedTag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionType?: boolean
    status?: boolean
    processedBy?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "companyId" | "rawText" | "transactionDate" | "amount" | "normalizedUniqueKey" | "isAnomaly" | "anomalyScore" | "llmResponse" | "userClarification" | "finalDebitAccount" | "finalCreditAccount" | "finalSuggestedTag" | "createdAt" | "updatedAt" | "transactionType" | "status" | "processedBy", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      companyId: string
      rawText: string
      transactionDate: Date
      amount: bigint
      normalizedUniqueKey: string | null
      isAnomaly: boolean
      anomalyScore: Prisma.Decimal | null
      llmResponse: Prisma.JsonValue | null
      userClarification: Prisma.JsonValue | null
      finalDebitAccount: string | null
      finalCreditAccount: string | null
      finalSuggestedTag: string | null
      createdAt: Date
      updatedAt: Date
      transactionType: $Enums.TransactionIOType
      status: $Enums.TransactionStatus
      processedBy: $Enums.ProcessorType | null
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'BigInt'>
    readonly companyId: FieldRef<"Transaction", 'String'>
    readonly rawText: FieldRef<"Transaction", 'String'>
    readonly transactionDate: FieldRef<"Transaction", 'DateTime'>
    readonly amount: FieldRef<"Transaction", 'BigInt'>
    readonly normalizedUniqueKey: FieldRef<"Transaction", 'String'>
    readonly isAnomaly: FieldRef<"Transaction", 'Boolean'>
    readonly anomalyScore: FieldRef<"Transaction", 'Decimal'>
    readonly llmResponse: FieldRef<"Transaction", 'Json'>
    readonly userClarification: FieldRef<"Transaction", 'Json'>
    readonly finalDebitAccount: FieldRef<"Transaction", 'String'>
    readonly finalCreditAccount: FieldRef<"Transaction", 'String'>
    readonly finalSuggestedTag: FieldRef<"Transaction", 'String'>
    readonly createdAt: FieldRef<"Transaction", 'DateTime'>
    readonly updatedAt: FieldRef<"Transaction", 'DateTime'>
    readonly transactionType: FieldRef<"Transaction", 'TransactionIOType'>
    readonly status: FieldRef<"Transaction", 'TransactionStatus'>
    readonly processedBy: FieldRef<"Transaction", 'ProcessorType'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Model DatacollectionGyeonggiDelivery
   */

  export type AggregateDatacollectionGyeonggiDelivery = {
    _count: DatacollectionGyeonggiDeliveryCountAggregateOutputType | null
    _avg: DatacollectionGyeonggiDeliveryAvgAggregateOutputType | null
    _sum: DatacollectionGyeonggiDeliverySumAggregateOutputType | null
    _min: DatacollectionGyeonggiDeliveryMinAggregateOutputType | null
    _max: DatacollectionGyeonggiDeliveryMaxAggregateOutputType | null
  }

  export type DatacollectionGyeonggiDeliveryAvgAggregateOutputType = {
    listTotalCount: number | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
  }

  export type DatacollectionGyeonggiDeliverySumAggregateOutputType = {
    listTotalCount: number | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
  }

  export type DatacollectionGyeonggiDeliveryMinAggregateOutputType = {
    id: string | null
    listTotalCount: number | null
    responseCode: string | null
    responseMessage: string | null
    apiVersion: string | null
    businessRegNo: string | null
    sigunName: string | null
    storeName: string | null
    industryType: string | null
    refinedRoadAddress: string | null
    refinedLotAddress: string | null
    refinedZipcode: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    dataSource: string | null
    collectionBatchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DatacollectionGyeonggiDeliveryMaxAggregateOutputType = {
    id: string | null
    listTotalCount: number | null
    responseCode: string | null
    responseMessage: string | null
    apiVersion: string | null
    businessRegNo: string | null
    sigunName: string | null
    storeName: string | null
    industryType: string | null
    refinedRoadAddress: string | null
    refinedLotAddress: string | null
    refinedZipcode: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    dataSource: string | null
    collectionBatchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DatacollectionGyeonggiDeliveryCountAggregateOutputType = {
    id: number
    listTotalCount: number
    responseCode: number
    responseMessage: number
    apiVersion: number
    businessRegNo: number
    sigunName: number
    storeName: number
    industryType: number
    refinedRoadAddress: number
    refinedLotAddress: number
    refinedZipcode: number
    refinedLatitude: number
    refinedLongitude: number
    dataSource: number
    collectionBatchId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DatacollectionGyeonggiDeliveryAvgAggregateInputType = {
    listTotalCount?: true
    refinedLatitude?: true
    refinedLongitude?: true
  }

  export type DatacollectionGyeonggiDeliverySumAggregateInputType = {
    listTotalCount?: true
    refinedLatitude?: true
    refinedLongitude?: true
  }

  export type DatacollectionGyeonggiDeliveryMinAggregateInputType = {
    id?: true
    listTotalCount?: true
    responseCode?: true
    responseMessage?: true
    apiVersion?: true
    businessRegNo?: true
    sigunName?: true
    storeName?: true
    industryType?: true
    refinedRoadAddress?: true
    refinedLotAddress?: true
    refinedZipcode?: true
    refinedLatitude?: true
    refinedLongitude?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DatacollectionGyeonggiDeliveryMaxAggregateInputType = {
    id?: true
    listTotalCount?: true
    responseCode?: true
    responseMessage?: true
    apiVersion?: true
    businessRegNo?: true
    sigunName?: true
    storeName?: true
    industryType?: true
    refinedRoadAddress?: true
    refinedLotAddress?: true
    refinedZipcode?: true
    refinedLatitude?: true
    refinedLongitude?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DatacollectionGyeonggiDeliveryCountAggregateInputType = {
    id?: true
    listTotalCount?: true
    responseCode?: true
    responseMessage?: true
    apiVersion?: true
    businessRegNo?: true
    sigunName?: true
    storeName?: true
    industryType?: true
    refinedRoadAddress?: true
    refinedLotAddress?: true
    refinedZipcode?: true
    refinedLatitude?: true
    refinedLongitude?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DatacollectionGyeonggiDeliveryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatacollectionGyeonggiDelivery to aggregate.
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionGyeonggiDeliveries to fetch.
     */
    orderBy?: DatacollectionGyeonggiDeliveryOrderByWithRelationInput | DatacollectionGyeonggiDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatacollectionGyeonggiDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionGyeonggiDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionGyeonggiDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatacollectionGyeonggiDeliveries
    **/
    _count?: true | DatacollectionGyeonggiDeliveryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DatacollectionGyeonggiDeliveryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DatacollectionGyeonggiDeliverySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatacollectionGyeonggiDeliveryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatacollectionGyeonggiDeliveryMaxAggregateInputType
  }

  export type GetDatacollectionGyeonggiDeliveryAggregateType<T extends DatacollectionGyeonggiDeliveryAggregateArgs> = {
        [P in keyof T & keyof AggregateDatacollectionGyeonggiDelivery]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatacollectionGyeonggiDelivery[P]>
      : GetScalarType<T[P], AggregateDatacollectionGyeonggiDelivery[P]>
  }




  export type DatacollectionGyeonggiDeliveryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatacollectionGyeonggiDeliveryWhereInput
    orderBy?: DatacollectionGyeonggiDeliveryOrderByWithAggregationInput | DatacollectionGyeonggiDeliveryOrderByWithAggregationInput[]
    by: DatacollectionGyeonggiDeliveryScalarFieldEnum[] | DatacollectionGyeonggiDeliveryScalarFieldEnum
    having?: DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatacollectionGyeonggiDeliveryCountAggregateInputType | true
    _avg?: DatacollectionGyeonggiDeliveryAvgAggregateInputType
    _sum?: DatacollectionGyeonggiDeliverySumAggregateInputType
    _min?: DatacollectionGyeonggiDeliveryMinAggregateInputType
    _max?: DatacollectionGyeonggiDeliveryMaxAggregateInputType
  }

  export type DatacollectionGyeonggiDeliveryGroupByOutputType = {
    id: string
    listTotalCount: number | null
    responseCode: string | null
    responseMessage: string | null
    apiVersion: string | null
    businessRegNo: string
    sigunName: string | null
    storeName: string
    industryType: string | null
    refinedRoadAddress: string | null
    refinedLotAddress: string | null
    refinedZipcode: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    dataSource: string
    collectionBatchId: string | null
    createdAt: Date
    updatedAt: Date
    _count: DatacollectionGyeonggiDeliveryCountAggregateOutputType | null
    _avg: DatacollectionGyeonggiDeliveryAvgAggregateOutputType | null
    _sum: DatacollectionGyeonggiDeliverySumAggregateOutputType | null
    _min: DatacollectionGyeonggiDeliveryMinAggregateOutputType | null
    _max: DatacollectionGyeonggiDeliveryMaxAggregateOutputType | null
  }

  type GetDatacollectionGyeonggiDeliveryGroupByPayload<T extends DatacollectionGyeonggiDeliveryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatacollectionGyeonggiDeliveryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatacollectionGyeonggiDeliveryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatacollectionGyeonggiDeliveryGroupByOutputType[P]>
            : GetScalarType<T[P], DatacollectionGyeonggiDeliveryGroupByOutputType[P]>
        }
      >
    >


  export type DatacollectionGyeonggiDeliverySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listTotalCount?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    apiVersion?: boolean
    businessRegNo?: boolean
    sigunName?: boolean
    storeName?: boolean
    industryType?: boolean
    refinedRoadAddress?: boolean
    refinedLotAddress?: boolean
    refinedZipcode?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datacollectionGyeonggiDelivery"]>

  export type DatacollectionGyeonggiDeliverySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listTotalCount?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    apiVersion?: boolean
    businessRegNo?: boolean
    sigunName?: boolean
    storeName?: boolean
    industryType?: boolean
    refinedRoadAddress?: boolean
    refinedLotAddress?: boolean
    refinedZipcode?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datacollectionGyeonggiDelivery"]>

  export type DatacollectionGyeonggiDeliverySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listTotalCount?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    apiVersion?: boolean
    businessRegNo?: boolean
    sigunName?: boolean
    storeName?: boolean
    industryType?: boolean
    refinedRoadAddress?: boolean
    refinedLotAddress?: boolean
    refinedZipcode?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datacollectionGyeonggiDelivery"]>

  export type DatacollectionGyeonggiDeliverySelectScalar = {
    id?: boolean
    listTotalCount?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    apiVersion?: boolean
    businessRegNo?: boolean
    sigunName?: boolean
    storeName?: boolean
    industryType?: boolean
    refinedRoadAddress?: boolean
    refinedLotAddress?: boolean
    refinedZipcode?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DatacollectionGyeonggiDeliveryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "listTotalCount" | "responseCode" | "responseMessage" | "apiVersion" | "businessRegNo" | "sigunName" | "storeName" | "industryType" | "refinedRoadAddress" | "refinedLotAddress" | "refinedZipcode" | "refinedLatitude" | "refinedLongitude" | "dataSource" | "collectionBatchId" | "createdAt" | "updatedAt", ExtArgs["result"]["datacollectionGyeonggiDelivery"]>

  export type $DatacollectionGyeonggiDeliveryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatacollectionGyeonggiDelivery"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      listTotalCount: number | null
      responseCode: string | null
      responseMessage: string | null
      apiVersion: string | null
      businessRegNo: string
      sigunName: string | null
      storeName: string
      industryType: string | null
      refinedRoadAddress: string | null
      refinedLotAddress: string | null
      refinedZipcode: string | null
      refinedLatitude: Prisma.Decimal | null
      refinedLongitude: Prisma.Decimal | null
      dataSource: string
      collectionBatchId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["datacollectionGyeonggiDelivery"]>
    composites: {}
  }

  type DatacollectionGyeonggiDeliveryGetPayload<S extends boolean | null | undefined | DatacollectionGyeonggiDeliveryDefaultArgs> = $Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload, S>

  type DatacollectionGyeonggiDeliveryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatacollectionGyeonggiDeliveryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatacollectionGyeonggiDeliveryCountAggregateInputType | true
    }

  export interface DatacollectionGyeonggiDeliveryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatacollectionGyeonggiDelivery'], meta: { name: 'DatacollectionGyeonggiDelivery' } }
    /**
     * Find zero or one DatacollectionGyeonggiDelivery that matches the filter.
     * @param {DatacollectionGyeonggiDeliveryFindUniqueArgs} args - Arguments to find a DatacollectionGyeonggiDelivery
     * @example
     * // Get one DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatacollectionGyeonggiDeliveryFindUniqueArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryFindUniqueArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatacollectionGyeonggiDelivery that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatacollectionGyeonggiDeliveryFindUniqueOrThrowArgs} args - Arguments to find a DatacollectionGyeonggiDelivery
     * @example
     * // Get one DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatacollectionGyeonggiDeliveryFindUniqueOrThrowArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatacollectionGyeonggiDelivery that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryFindFirstArgs} args - Arguments to find a DatacollectionGyeonggiDelivery
     * @example
     * // Get one DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatacollectionGyeonggiDeliveryFindFirstArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryFindFirstArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatacollectionGyeonggiDelivery that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryFindFirstOrThrowArgs} args - Arguments to find a DatacollectionGyeonggiDelivery
     * @example
     * // Get one DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatacollectionGyeonggiDeliveryFindFirstOrThrowArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatacollectionGyeonggiDeliveries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDeliveries = await prisma.datacollectionGyeonggiDelivery.findMany()
     * 
     * // Get first 10 DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDeliveries = await prisma.datacollectionGyeonggiDelivery.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const datacollectionGyeonggiDeliveryWithIdOnly = await prisma.datacollectionGyeonggiDelivery.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatacollectionGyeonggiDeliveryFindManyArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatacollectionGyeonggiDelivery.
     * @param {DatacollectionGyeonggiDeliveryCreateArgs} args - Arguments to create a DatacollectionGyeonggiDelivery.
     * @example
     * // Create one DatacollectionGyeonggiDelivery
     * const DatacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.create({
     *   data: {
     *     // ... data to create a DatacollectionGyeonggiDelivery
     *   }
     * })
     * 
     */
    create<T extends DatacollectionGyeonggiDeliveryCreateArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryCreateArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatacollectionGyeonggiDeliveries.
     * @param {DatacollectionGyeonggiDeliveryCreateManyArgs} args - Arguments to create many DatacollectionGyeonggiDeliveries.
     * @example
     * // Create many DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatacollectionGyeonggiDeliveryCreateManyArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatacollectionGyeonggiDeliveries and returns the data saved in the database.
     * @param {DatacollectionGyeonggiDeliveryCreateManyAndReturnArgs} args - Arguments to create many DatacollectionGyeonggiDeliveries.
     * @example
     * // Create many DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatacollectionGyeonggiDeliveries and only return the `id`
     * const datacollectionGyeonggiDeliveryWithIdOnly = await prisma.datacollectionGyeonggiDelivery.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatacollectionGyeonggiDeliveryCreateManyAndReturnArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatacollectionGyeonggiDelivery.
     * @param {DatacollectionGyeonggiDeliveryDeleteArgs} args - Arguments to delete one DatacollectionGyeonggiDelivery.
     * @example
     * // Delete one DatacollectionGyeonggiDelivery
     * const DatacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.delete({
     *   where: {
     *     // ... filter to delete one DatacollectionGyeonggiDelivery
     *   }
     * })
     * 
     */
    delete<T extends DatacollectionGyeonggiDeliveryDeleteArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryDeleteArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatacollectionGyeonggiDelivery.
     * @param {DatacollectionGyeonggiDeliveryUpdateArgs} args - Arguments to update one DatacollectionGyeonggiDelivery.
     * @example
     * // Update one DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatacollectionGyeonggiDeliveryUpdateArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryUpdateArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatacollectionGyeonggiDeliveries.
     * @param {DatacollectionGyeonggiDeliveryDeleteManyArgs} args - Arguments to filter DatacollectionGyeonggiDeliveries to delete.
     * @example
     * // Delete a few DatacollectionGyeonggiDeliveries
     * const { count } = await prisma.datacollectionGyeonggiDelivery.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatacollectionGyeonggiDeliveryDeleteManyArgs>(args?: SelectSubset<T, DatacollectionGyeonggiDeliveryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatacollectionGyeonggiDeliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatacollectionGyeonggiDeliveryUpdateManyArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatacollectionGyeonggiDeliveries and returns the data updated in the database.
     * @param {DatacollectionGyeonggiDeliveryUpdateManyAndReturnArgs} args - Arguments to update many DatacollectionGyeonggiDeliveries.
     * @example
     * // Update many DatacollectionGyeonggiDeliveries
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatacollectionGyeonggiDeliveries and only return the `id`
     * const datacollectionGyeonggiDeliveryWithIdOnly = await prisma.datacollectionGyeonggiDelivery.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DatacollectionGyeonggiDeliveryUpdateManyAndReturnArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatacollectionGyeonggiDelivery.
     * @param {DatacollectionGyeonggiDeliveryUpsertArgs} args - Arguments to update or create a DatacollectionGyeonggiDelivery.
     * @example
     * // Update or create a DatacollectionGyeonggiDelivery
     * const datacollectionGyeonggiDelivery = await prisma.datacollectionGyeonggiDelivery.upsert({
     *   create: {
     *     // ... data to create a DatacollectionGyeonggiDelivery
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatacollectionGyeonggiDelivery we want to update
     *   }
     * })
     */
    upsert<T extends DatacollectionGyeonggiDeliveryUpsertArgs>(args: SelectSubset<T, DatacollectionGyeonggiDeliveryUpsertArgs<ExtArgs>>): Prisma__DatacollectionGyeonggiDeliveryClient<$Result.GetResult<Prisma.$DatacollectionGyeonggiDeliveryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatacollectionGyeonggiDeliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryCountArgs} args - Arguments to filter DatacollectionGyeonggiDeliveries to count.
     * @example
     * // Count the number of DatacollectionGyeonggiDeliveries
     * const count = await prisma.datacollectionGyeonggiDelivery.count({
     *   where: {
     *     // ... the filter for the DatacollectionGyeonggiDeliveries we want to count
     *   }
     * })
    **/
    count<T extends DatacollectionGyeonggiDeliveryCountArgs>(
      args?: Subset<T, DatacollectionGyeonggiDeliveryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatacollectionGyeonggiDeliveryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatacollectionGyeonggiDelivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DatacollectionGyeonggiDeliveryAggregateArgs>(args: Subset<T, DatacollectionGyeonggiDeliveryAggregateArgs>): Prisma.PrismaPromise<GetDatacollectionGyeonggiDeliveryAggregateType<T>>

    /**
     * Group by DatacollectionGyeonggiDelivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionGyeonggiDeliveryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DatacollectionGyeonggiDeliveryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatacollectionGyeonggiDeliveryGroupByArgs['orderBy'] }
        : { orderBy?: DatacollectionGyeonggiDeliveryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DatacollectionGyeonggiDeliveryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatacollectionGyeonggiDeliveryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatacollectionGyeonggiDelivery model
   */
  readonly fields: DatacollectionGyeonggiDeliveryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatacollectionGyeonggiDelivery.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatacollectionGyeonggiDeliveryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DatacollectionGyeonggiDelivery model
   */
  interface DatacollectionGyeonggiDeliveryFieldRefs {
    readonly id: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly listTotalCount: FieldRef<"DatacollectionGyeonggiDelivery", 'Int'>
    readonly responseCode: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly responseMessage: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly apiVersion: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly businessRegNo: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly sigunName: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly storeName: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly industryType: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly refinedRoadAddress: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly refinedLotAddress: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly refinedZipcode: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly refinedLatitude: FieldRef<"DatacollectionGyeonggiDelivery", 'Decimal'>
    readonly refinedLongitude: FieldRef<"DatacollectionGyeonggiDelivery", 'Decimal'>
    readonly dataSource: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly collectionBatchId: FieldRef<"DatacollectionGyeonggiDelivery", 'String'>
    readonly createdAt: FieldRef<"DatacollectionGyeonggiDelivery", 'DateTime'>
    readonly updatedAt: FieldRef<"DatacollectionGyeonggiDelivery", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DatacollectionGyeonggiDelivery findUnique
   */
  export type DatacollectionGyeonggiDeliveryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionGyeonggiDelivery to fetch.
     */
    where: DatacollectionGyeonggiDeliveryWhereUniqueInput
  }

  /**
   * DatacollectionGyeonggiDelivery findUniqueOrThrow
   */
  export type DatacollectionGyeonggiDeliveryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionGyeonggiDelivery to fetch.
     */
    where: DatacollectionGyeonggiDeliveryWhereUniqueInput
  }

  /**
   * DatacollectionGyeonggiDelivery findFirst
   */
  export type DatacollectionGyeonggiDeliveryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionGyeonggiDelivery to fetch.
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionGyeonggiDeliveries to fetch.
     */
    orderBy?: DatacollectionGyeonggiDeliveryOrderByWithRelationInput | DatacollectionGyeonggiDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatacollectionGyeonggiDeliveries.
     */
    cursor?: DatacollectionGyeonggiDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionGyeonggiDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionGyeonggiDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatacollectionGyeonggiDeliveries.
     */
    distinct?: DatacollectionGyeonggiDeliveryScalarFieldEnum | DatacollectionGyeonggiDeliveryScalarFieldEnum[]
  }

  /**
   * DatacollectionGyeonggiDelivery findFirstOrThrow
   */
  export type DatacollectionGyeonggiDeliveryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionGyeonggiDelivery to fetch.
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionGyeonggiDeliveries to fetch.
     */
    orderBy?: DatacollectionGyeonggiDeliveryOrderByWithRelationInput | DatacollectionGyeonggiDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatacollectionGyeonggiDeliveries.
     */
    cursor?: DatacollectionGyeonggiDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionGyeonggiDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionGyeonggiDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatacollectionGyeonggiDeliveries.
     */
    distinct?: DatacollectionGyeonggiDeliveryScalarFieldEnum | DatacollectionGyeonggiDeliveryScalarFieldEnum[]
  }

  /**
   * DatacollectionGyeonggiDelivery findMany
   */
  export type DatacollectionGyeonggiDeliveryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionGyeonggiDeliveries to fetch.
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionGyeonggiDeliveries to fetch.
     */
    orderBy?: DatacollectionGyeonggiDeliveryOrderByWithRelationInput | DatacollectionGyeonggiDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatacollectionGyeonggiDeliveries.
     */
    cursor?: DatacollectionGyeonggiDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionGyeonggiDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionGyeonggiDeliveries.
     */
    skip?: number
    distinct?: DatacollectionGyeonggiDeliveryScalarFieldEnum | DatacollectionGyeonggiDeliveryScalarFieldEnum[]
  }

  /**
   * DatacollectionGyeonggiDelivery create
   */
  export type DatacollectionGyeonggiDeliveryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * The data needed to create a DatacollectionGyeonggiDelivery.
     */
    data: XOR<DatacollectionGyeonggiDeliveryCreateInput, DatacollectionGyeonggiDeliveryUncheckedCreateInput>
  }

  /**
   * DatacollectionGyeonggiDelivery createMany
   */
  export type DatacollectionGyeonggiDeliveryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatacollectionGyeonggiDeliveries.
     */
    data: DatacollectionGyeonggiDeliveryCreateManyInput | DatacollectionGyeonggiDeliveryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatacollectionGyeonggiDelivery createManyAndReturn
   */
  export type DatacollectionGyeonggiDeliveryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * The data used to create many DatacollectionGyeonggiDeliveries.
     */
    data: DatacollectionGyeonggiDeliveryCreateManyInput | DatacollectionGyeonggiDeliveryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatacollectionGyeonggiDelivery update
   */
  export type DatacollectionGyeonggiDeliveryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * The data needed to update a DatacollectionGyeonggiDelivery.
     */
    data: XOR<DatacollectionGyeonggiDeliveryUpdateInput, DatacollectionGyeonggiDeliveryUncheckedUpdateInput>
    /**
     * Choose, which DatacollectionGyeonggiDelivery to update.
     */
    where: DatacollectionGyeonggiDeliveryWhereUniqueInput
  }

  /**
   * DatacollectionGyeonggiDelivery updateMany
   */
  export type DatacollectionGyeonggiDeliveryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatacollectionGyeonggiDeliveries.
     */
    data: XOR<DatacollectionGyeonggiDeliveryUpdateManyMutationInput, DatacollectionGyeonggiDeliveryUncheckedUpdateManyInput>
    /**
     * Filter which DatacollectionGyeonggiDeliveries to update
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * Limit how many DatacollectionGyeonggiDeliveries to update.
     */
    limit?: number
  }

  /**
   * DatacollectionGyeonggiDelivery updateManyAndReturn
   */
  export type DatacollectionGyeonggiDeliveryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * The data used to update DatacollectionGyeonggiDeliveries.
     */
    data: XOR<DatacollectionGyeonggiDeliveryUpdateManyMutationInput, DatacollectionGyeonggiDeliveryUncheckedUpdateManyInput>
    /**
     * Filter which DatacollectionGyeonggiDeliveries to update
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * Limit how many DatacollectionGyeonggiDeliveries to update.
     */
    limit?: number
  }

  /**
   * DatacollectionGyeonggiDelivery upsert
   */
  export type DatacollectionGyeonggiDeliveryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * The filter to search for the DatacollectionGyeonggiDelivery to update in case it exists.
     */
    where: DatacollectionGyeonggiDeliveryWhereUniqueInput
    /**
     * In case the DatacollectionGyeonggiDelivery found by the `where` argument doesn't exist, create a new DatacollectionGyeonggiDelivery with this data.
     */
    create: XOR<DatacollectionGyeonggiDeliveryCreateInput, DatacollectionGyeonggiDeliveryUncheckedCreateInput>
    /**
     * In case the DatacollectionGyeonggiDelivery was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatacollectionGyeonggiDeliveryUpdateInput, DatacollectionGyeonggiDeliveryUncheckedUpdateInput>
  }

  /**
   * DatacollectionGyeonggiDelivery delete
   */
  export type DatacollectionGyeonggiDeliveryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
    /**
     * Filter which DatacollectionGyeonggiDelivery to delete.
     */
    where: DatacollectionGyeonggiDeliveryWhereUniqueInput
  }

  /**
   * DatacollectionGyeonggiDelivery deleteMany
   */
  export type DatacollectionGyeonggiDeliveryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatacollectionGyeonggiDeliveries to delete
     */
    where?: DatacollectionGyeonggiDeliveryWhereInput
    /**
     * Limit how many DatacollectionGyeonggiDeliveries to delete.
     */
    limit?: number
  }

  /**
   * DatacollectionGyeonggiDelivery without action
   */
  export type DatacollectionGyeonggiDeliveryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionGyeonggiDelivery
     */
    select?: DatacollectionGyeonggiDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionGyeonggiDelivery
     */
    omit?: DatacollectionGyeonggiDeliveryOmit<ExtArgs> | null
  }


  /**
   * Model DatacollectionSeoulRestaurants
   */

  export type AggregateDatacollectionSeoulRestaurants = {
    _count: DatacollectionSeoulRestaurantsCountAggregateOutputType | null
    _avg: DatacollectionSeoulRestaurantsAvgAggregateOutputType | null
    _sum: DatacollectionSeoulRestaurantsSumAggregateOutputType | null
    _min: DatacollectionSeoulRestaurantsMinAggregateOutputType | null
    _max: DatacollectionSeoulRestaurantsMaxAggregateOutputType | null
  }

  export type DatacollectionSeoulRestaurantsAvgAggregateOutputType = {
    listTotalCount: number | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
  }

  export type DatacollectionSeoulRestaurantsSumAggregateOutputType = {
    listTotalCount: number | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
  }

  export type DatacollectionSeoulRestaurantsMinAggregateOutputType = {
    id: string | null
    licenseDate: string | null
    businessStatusCode: string | null
    businessStatusName: string | null
    businessName: string | null
    businessType: string | null
    dataSource: string | null
    collectionBatchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    apiVersion: string | null
    businessRegistrationNumber: string | null
    licenseExpiryDate: string | null
    listTotalCount: number | null
    lotNumberAddress: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    responseCode: string | null
    responseMessage: string | null
    roadNameAddress: string | null
    zipCode: string | null
  }

  export type DatacollectionSeoulRestaurantsMaxAggregateOutputType = {
    id: string | null
    licenseDate: string | null
    businessStatusCode: string | null
    businessStatusName: string | null
    businessName: string | null
    businessType: string | null
    dataSource: string | null
    collectionBatchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    apiVersion: string | null
    businessRegistrationNumber: string | null
    licenseExpiryDate: string | null
    listTotalCount: number | null
    lotNumberAddress: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    responseCode: string | null
    responseMessage: string | null
    roadNameAddress: string | null
    zipCode: string | null
  }

  export type DatacollectionSeoulRestaurantsCountAggregateOutputType = {
    id: number
    licenseDate: number
    businessStatusCode: number
    businessStatusName: number
    businessName: number
    businessType: number
    dataSource: number
    collectionBatchId: number
    createdAt: number
    updatedAt: number
    apiVersion: number
    businessRegistrationNumber: number
    licenseExpiryDate: number
    listTotalCount: number
    lotNumberAddress: number
    refinedLatitude: number
    refinedLongitude: number
    responseCode: number
    responseMessage: number
    roadNameAddress: number
    zipCode: number
    _all: number
  }


  export type DatacollectionSeoulRestaurantsAvgAggregateInputType = {
    listTotalCount?: true
    refinedLatitude?: true
    refinedLongitude?: true
  }

  export type DatacollectionSeoulRestaurantsSumAggregateInputType = {
    listTotalCount?: true
    refinedLatitude?: true
    refinedLongitude?: true
  }

  export type DatacollectionSeoulRestaurantsMinAggregateInputType = {
    id?: true
    licenseDate?: true
    businessStatusCode?: true
    businessStatusName?: true
    businessName?: true
    businessType?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
    apiVersion?: true
    businessRegistrationNumber?: true
    licenseExpiryDate?: true
    listTotalCount?: true
    lotNumberAddress?: true
    refinedLatitude?: true
    refinedLongitude?: true
    responseCode?: true
    responseMessage?: true
    roadNameAddress?: true
    zipCode?: true
  }

  export type DatacollectionSeoulRestaurantsMaxAggregateInputType = {
    id?: true
    licenseDate?: true
    businessStatusCode?: true
    businessStatusName?: true
    businessName?: true
    businessType?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
    apiVersion?: true
    businessRegistrationNumber?: true
    licenseExpiryDate?: true
    listTotalCount?: true
    lotNumberAddress?: true
    refinedLatitude?: true
    refinedLongitude?: true
    responseCode?: true
    responseMessage?: true
    roadNameAddress?: true
    zipCode?: true
  }

  export type DatacollectionSeoulRestaurantsCountAggregateInputType = {
    id?: true
    licenseDate?: true
    businessStatusCode?: true
    businessStatusName?: true
    businessName?: true
    businessType?: true
    dataSource?: true
    collectionBatchId?: true
    createdAt?: true
    updatedAt?: true
    apiVersion?: true
    businessRegistrationNumber?: true
    licenseExpiryDate?: true
    listTotalCount?: true
    lotNumberAddress?: true
    refinedLatitude?: true
    refinedLongitude?: true
    responseCode?: true
    responseMessage?: true
    roadNameAddress?: true
    zipCode?: true
    _all?: true
  }

  export type DatacollectionSeoulRestaurantsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatacollectionSeoulRestaurants to aggregate.
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionSeoulRestaurants to fetch.
     */
    orderBy?: DatacollectionSeoulRestaurantsOrderByWithRelationInput | DatacollectionSeoulRestaurantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatacollectionSeoulRestaurantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionSeoulRestaurants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionSeoulRestaurants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatacollectionSeoulRestaurants
    **/
    _count?: true | DatacollectionSeoulRestaurantsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DatacollectionSeoulRestaurantsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DatacollectionSeoulRestaurantsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatacollectionSeoulRestaurantsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatacollectionSeoulRestaurantsMaxAggregateInputType
  }

  export type GetDatacollectionSeoulRestaurantsAggregateType<T extends DatacollectionSeoulRestaurantsAggregateArgs> = {
        [P in keyof T & keyof AggregateDatacollectionSeoulRestaurants]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatacollectionSeoulRestaurants[P]>
      : GetScalarType<T[P], AggregateDatacollectionSeoulRestaurants[P]>
  }




  export type DatacollectionSeoulRestaurantsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatacollectionSeoulRestaurantsWhereInput
    orderBy?: DatacollectionSeoulRestaurantsOrderByWithAggregationInput | DatacollectionSeoulRestaurantsOrderByWithAggregationInput[]
    by: DatacollectionSeoulRestaurantsScalarFieldEnum[] | DatacollectionSeoulRestaurantsScalarFieldEnum
    having?: DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatacollectionSeoulRestaurantsCountAggregateInputType | true
    _avg?: DatacollectionSeoulRestaurantsAvgAggregateInputType
    _sum?: DatacollectionSeoulRestaurantsSumAggregateInputType
    _min?: DatacollectionSeoulRestaurantsMinAggregateInputType
    _max?: DatacollectionSeoulRestaurantsMaxAggregateInputType
  }

  export type DatacollectionSeoulRestaurantsGroupByOutputType = {
    id: string
    licenseDate: string | null
    businessStatusCode: string | null
    businessStatusName: string | null
    businessName: string
    businessType: string | null
    dataSource: string
    collectionBatchId: string | null
    createdAt: Date
    updatedAt: Date
    apiVersion: string | null
    businessRegistrationNumber: string | null
    licenseExpiryDate: string | null
    listTotalCount: number | null
    lotNumberAddress: string | null
    refinedLatitude: Decimal | null
    refinedLongitude: Decimal | null
    responseCode: string | null
    responseMessage: string | null
    roadNameAddress: string | null
    zipCode: string | null
    _count: DatacollectionSeoulRestaurantsCountAggregateOutputType | null
    _avg: DatacollectionSeoulRestaurantsAvgAggregateOutputType | null
    _sum: DatacollectionSeoulRestaurantsSumAggregateOutputType | null
    _min: DatacollectionSeoulRestaurantsMinAggregateOutputType | null
    _max: DatacollectionSeoulRestaurantsMaxAggregateOutputType | null
  }

  type GetDatacollectionSeoulRestaurantsGroupByPayload<T extends DatacollectionSeoulRestaurantsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatacollectionSeoulRestaurantsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatacollectionSeoulRestaurantsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatacollectionSeoulRestaurantsGroupByOutputType[P]>
            : GetScalarType<T[P], DatacollectionSeoulRestaurantsGroupByOutputType[P]>
        }
      >
    >


  export type DatacollectionSeoulRestaurantsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    licenseDate?: boolean
    businessStatusCode?: boolean
    businessStatusName?: boolean
    businessName?: boolean
    businessType?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apiVersion?: boolean
    businessRegistrationNumber?: boolean
    licenseExpiryDate?: boolean
    listTotalCount?: boolean
    lotNumberAddress?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    roadNameAddress?: boolean
    zipCode?: boolean
  }, ExtArgs["result"]["datacollectionSeoulRestaurants"]>

  export type DatacollectionSeoulRestaurantsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    licenseDate?: boolean
    businessStatusCode?: boolean
    businessStatusName?: boolean
    businessName?: boolean
    businessType?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apiVersion?: boolean
    businessRegistrationNumber?: boolean
    licenseExpiryDate?: boolean
    listTotalCount?: boolean
    lotNumberAddress?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    roadNameAddress?: boolean
    zipCode?: boolean
  }, ExtArgs["result"]["datacollectionSeoulRestaurants"]>

  export type DatacollectionSeoulRestaurantsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    licenseDate?: boolean
    businessStatusCode?: boolean
    businessStatusName?: boolean
    businessName?: boolean
    businessType?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apiVersion?: boolean
    businessRegistrationNumber?: boolean
    licenseExpiryDate?: boolean
    listTotalCount?: boolean
    lotNumberAddress?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    roadNameAddress?: boolean
    zipCode?: boolean
  }, ExtArgs["result"]["datacollectionSeoulRestaurants"]>

  export type DatacollectionSeoulRestaurantsSelectScalar = {
    id?: boolean
    licenseDate?: boolean
    businessStatusCode?: boolean
    businessStatusName?: boolean
    businessName?: boolean
    businessType?: boolean
    dataSource?: boolean
    collectionBatchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apiVersion?: boolean
    businessRegistrationNumber?: boolean
    licenseExpiryDate?: boolean
    listTotalCount?: boolean
    lotNumberAddress?: boolean
    refinedLatitude?: boolean
    refinedLongitude?: boolean
    responseCode?: boolean
    responseMessage?: boolean
    roadNameAddress?: boolean
    zipCode?: boolean
  }

  export type DatacollectionSeoulRestaurantsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "licenseDate" | "businessStatusCode" | "businessStatusName" | "businessName" | "businessType" | "dataSource" | "collectionBatchId" | "createdAt" | "updatedAt" | "apiVersion" | "businessRegistrationNumber" | "licenseExpiryDate" | "listTotalCount" | "lotNumberAddress" | "refinedLatitude" | "refinedLongitude" | "responseCode" | "responseMessage" | "roadNameAddress" | "zipCode", ExtArgs["result"]["datacollectionSeoulRestaurants"]>

  export type $DatacollectionSeoulRestaurantsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatacollectionSeoulRestaurants"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      licenseDate: string | null
      businessStatusCode: string | null
      businessStatusName: string | null
      businessName: string
      businessType: string | null
      dataSource: string
      collectionBatchId: string | null
      createdAt: Date
      updatedAt: Date
      apiVersion: string | null
      businessRegistrationNumber: string | null
      licenseExpiryDate: string | null
      listTotalCount: number | null
      lotNumberAddress: string | null
      refinedLatitude: Prisma.Decimal | null
      refinedLongitude: Prisma.Decimal | null
      responseCode: string | null
      responseMessage: string | null
      roadNameAddress: string | null
      zipCode: string | null
    }, ExtArgs["result"]["datacollectionSeoulRestaurants"]>
    composites: {}
  }

  type DatacollectionSeoulRestaurantsGetPayload<S extends boolean | null | undefined | DatacollectionSeoulRestaurantsDefaultArgs> = $Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload, S>

  type DatacollectionSeoulRestaurantsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatacollectionSeoulRestaurantsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatacollectionSeoulRestaurantsCountAggregateInputType | true
    }

  export interface DatacollectionSeoulRestaurantsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatacollectionSeoulRestaurants'], meta: { name: 'DatacollectionSeoulRestaurants' } }
    /**
     * Find zero or one DatacollectionSeoulRestaurants that matches the filter.
     * @param {DatacollectionSeoulRestaurantsFindUniqueArgs} args - Arguments to find a DatacollectionSeoulRestaurants
     * @example
     * // Get one DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatacollectionSeoulRestaurantsFindUniqueArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsFindUniqueArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatacollectionSeoulRestaurants that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatacollectionSeoulRestaurantsFindUniqueOrThrowArgs} args - Arguments to find a DatacollectionSeoulRestaurants
     * @example
     * // Get one DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatacollectionSeoulRestaurantsFindUniqueOrThrowArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatacollectionSeoulRestaurants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsFindFirstArgs} args - Arguments to find a DatacollectionSeoulRestaurants
     * @example
     * // Get one DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatacollectionSeoulRestaurantsFindFirstArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsFindFirstArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatacollectionSeoulRestaurants that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsFindFirstOrThrowArgs} args - Arguments to find a DatacollectionSeoulRestaurants
     * @example
     * // Get one DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatacollectionSeoulRestaurantsFindFirstOrThrowArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatacollectionSeoulRestaurants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findMany()
     * 
     * // Get first 10 DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const datacollectionSeoulRestaurantsWithIdOnly = await prisma.datacollectionSeoulRestaurants.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatacollectionSeoulRestaurantsFindManyArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsCreateArgs} args - Arguments to create a DatacollectionSeoulRestaurants.
     * @example
     * // Create one DatacollectionSeoulRestaurants
     * const DatacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.create({
     *   data: {
     *     // ... data to create a DatacollectionSeoulRestaurants
     *   }
     * })
     * 
     */
    create<T extends DatacollectionSeoulRestaurantsCreateArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsCreateArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsCreateManyArgs} args - Arguments to create many DatacollectionSeoulRestaurants.
     * @example
     * // Create many DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatacollectionSeoulRestaurantsCreateManyArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatacollectionSeoulRestaurants and returns the data saved in the database.
     * @param {DatacollectionSeoulRestaurantsCreateManyAndReturnArgs} args - Arguments to create many DatacollectionSeoulRestaurants.
     * @example
     * // Create many DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatacollectionSeoulRestaurants and only return the `id`
     * const datacollectionSeoulRestaurantsWithIdOnly = await prisma.datacollectionSeoulRestaurants.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatacollectionSeoulRestaurantsCreateManyAndReturnArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsDeleteArgs} args - Arguments to delete one DatacollectionSeoulRestaurants.
     * @example
     * // Delete one DatacollectionSeoulRestaurants
     * const DatacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.delete({
     *   where: {
     *     // ... filter to delete one DatacollectionSeoulRestaurants
     *   }
     * })
     * 
     */
    delete<T extends DatacollectionSeoulRestaurantsDeleteArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsDeleteArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsUpdateArgs} args - Arguments to update one DatacollectionSeoulRestaurants.
     * @example
     * // Update one DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatacollectionSeoulRestaurantsUpdateArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsUpdateArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsDeleteManyArgs} args - Arguments to filter DatacollectionSeoulRestaurants to delete.
     * @example
     * // Delete a few DatacollectionSeoulRestaurants
     * const { count } = await prisma.datacollectionSeoulRestaurants.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatacollectionSeoulRestaurantsDeleteManyArgs>(args?: SelectSubset<T, DatacollectionSeoulRestaurantsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatacollectionSeoulRestaurants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatacollectionSeoulRestaurantsUpdateManyArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatacollectionSeoulRestaurants and returns the data updated in the database.
     * @param {DatacollectionSeoulRestaurantsUpdateManyAndReturnArgs} args - Arguments to update many DatacollectionSeoulRestaurants.
     * @example
     * // Update many DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatacollectionSeoulRestaurants and only return the `id`
     * const datacollectionSeoulRestaurantsWithIdOnly = await prisma.datacollectionSeoulRestaurants.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DatacollectionSeoulRestaurantsUpdateManyAndReturnArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatacollectionSeoulRestaurants.
     * @param {DatacollectionSeoulRestaurantsUpsertArgs} args - Arguments to update or create a DatacollectionSeoulRestaurants.
     * @example
     * // Update or create a DatacollectionSeoulRestaurants
     * const datacollectionSeoulRestaurants = await prisma.datacollectionSeoulRestaurants.upsert({
     *   create: {
     *     // ... data to create a DatacollectionSeoulRestaurants
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatacollectionSeoulRestaurants we want to update
     *   }
     * })
     */
    upsert<T extends DatacollectionSeoulRestaurantsUpsertArgs>(args: SelectSubset<T, DatacollectionSeoulRestaurantsUpsertArgs<ExtArgs>>): Prisma__DatacollectionSeoulRestaurantsClient<$Result.GetResult<Prisma.$DatacollectionSeoulRestaurantsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatacollectionSeoulRestaurants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsCountArgs} args - Arguments to filter DatacollectionSeoulRestaurants to count.
     * @example
     * // Count the number of DatacollectionSeoulRestaurants
     * const count = await prisma.datacollectionSeoulRestaurants.count({
     *   where: {
     *     // ... the filter for the DatacollectionSeoulRestaurants we want to count
     *   }
     * })
    **/
    count<T extends DatacollectionSeoulRestaurantsCountArgs>(
      args?: Subset<T, DatacollectionSeoulRestaurantsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatacollectionSeoulRestaurantsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatacollectionSeoulRestaurants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DatacollectionSeoulRestaurantsAggregateArgs>(args: Subset<T, DatacollectionSeoulRestaurantsAggregateArgs>): Prisma.PrismaPromise<GetDatacollectionSeoulRestaurantsAggregateType<T>>

    /**
     * Group by DatacollectionSeoulRestaurants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatacollectionSeoulRestaurantsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DatacollectionSeoulRestaurantsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatacollectionSeoulRestaurantsGroupByArgs['orderBy'] }
        : { orderBy?: DatacollectionSeoulRestaurantsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DatacollectionSeoulRestaurantsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatacollectionSeoulRestaurantsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatacollectionSeoulRestaurants model
   */
  readonly fields: DatacollectionSeoulRestaurantsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatacollectionSeoulRestaurants.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatacollectionSeoulRestaurantsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DatacollectionSeoulRestaurants model
   */
  interface DatacollectionSeoulRestaurantsFieldRefs {
    readonly id: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly licenseDate: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly businessStatusCode: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly businessStatusName: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly businessName: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly businessType: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly dataSource: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly collectionBatchId: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly createdAt: FieldRef<"DatacollectionSeoulRestaurants", 'DateTime'>
    readonly updatedAt: FieldRef<"DatacollectionSeoulRestaurants", 'DateTime'>
    readonly apiVersion: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly businessRegistrationNumber: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly licenseExpiryDate: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly listTotalCount: FieldRef<"DatacollectionSeoulRestaurants", 'Int'>
    readonly lotNumberAddress: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly refinedLatitude: FieldRef<"DatacollectionSeoulRestaurants", 'Decimal'>
    readonly refinedLongitude: FieldRef<"DatacollectionSeoulRestaurants", 'Decimal'>
    readonly responseCode: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly responseMessage: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly roadNameAddress: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
    readonly zipCode: FieldRef<"DatacollectionSeoulRestaurants", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DatacollectionSeoulRestaurants findUnique
   */
  export type DatacollectionSeoulRestaurantsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionSeoulRestaurants to fetch.
     */
    where: DatacollectionSeoulRestaurantsWhereUniqueInput
  }

  /**
   * DatacollectionSeoulRestaurants findUniqueOrThrow
   */
  export type DatacollectionSeoulRestaurantsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionSeoulRestaurants to fetch.
     */
    where: DatacollectionSeoulRestaurantsWhereUniqueInput
  }

  /**
   * DatacollectionSeoulRestaurants findFirst
   */
  export type DatacollectionSeoulRestaurantsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionSeoulRestaurants to fetch.
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionSeoulRestaurants to fetch.
     */
    orderBy?: DatacollectionSeoulRestaurantsOrderByWithRelationInput | DatacollectionSeoulRestaurantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatacollectionSeoulRestaurants.
     */
    cursor?: DatacollectionSeoulRestaurantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionSeoulRestaurants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionSeoulRestaurants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatacollectionSeoulRestaurants.
     */
    distinct?: DatacollectionSeoulRestaurantsScalarFieldEnum | DatacollectionSeoulRestaurantsScalarFieldEnum[]
  }

  /**
   * DatacollectionSeoulRestaurants findFirstOrThrow
   */
  export type DatacollectionSeoulRestaurantsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionSeoulRestaurants to fetch.
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionSeoulRestaurants to fetch.
     */
    orderBy?: DatacollectionSeoulRestaurantsOrderByWithRelationInput | DatacollectionSeoulRestaurantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatacollectionSeoulRestaurants.
     */
    cursor?: DatacollectionSeoulRestaurantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionSeoulRestaurants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionSeoulRestaurants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatacollectionSeoulRestaurants.
     */
    distinct?: DatacollectionSeoulRestaurantsScalarFieldEnum | DatacollectionSeoulRestaurantsScalarFieldEnum[]
  }

  /**
   * DatacollectionSeoulRestaurants findMany
   */
  export type DatacollectionSeoulRestaurantsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter, which DatacollectionSeoulRestaurants to fetch.
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatacollectionSeoulRestaurants to fetch.
     */
    orderBy?: DatacollectionSeoulRestaurantsOrderByWithRelationInput | DatacollectionSeoulRestaurantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatacollectionSeoulRestaurants.
     */
    cursor?: DatacollectionSeoulRestaurantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatacollectionSeoulRestaurants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatacollectionSeoulRestaurants.
     */
    skip?: number
    distinct?: DatacollectionSeoulRestaurantsScalarFieldEnum | DatacollectionSeoulRestaurantsScalarFieldEnum[]
  }

  /**
   * DatacollectionSeoulRestaurants create
   */
  export type DatacollectionSeoulRestaurantsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * The data needed to create a DatacollectionSeoulRestaurants.
     */
    data: XOR<DatacollectionSeoulRestaurantsCreateInput, DatacollectionSeoulRestaurantsUncheckedCreateInput>
  }

  /**
   * DatacollectionSeoulRestaurants createMany
   */
  export type DatacollectionSeoulRestaurantsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatacollectionSeoulRestaurants.
     */
    data: DatacollectionSeoulRestaurantsCreateManyInput | DatacollectionSeoulRestaurantsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatacollectionSeoulRestaurants createManyAndReturn
   */
  export type DatacollectionSeoulRestaurantsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * The data used to create many DatacollectionSeoulRestaurants.
     */
    data: DatacollectionSeoulRestaurantsCreateManyInput | DatacollectionSeoulRestaurantsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatacollectionSeoulRestaurants update
   */
  export type DatacollectionSeoulRestaurantsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * The data needed to update a DatacollectionSeoulRestaurants.
     */
    data: XOR<DatacollectionSeoulRestaurantsUpdateInput, DatacollectionSeoulRestaurantsUncheckedUpdateInput>
    /**
     * Choose, which DatacollectionSeoulRestaurants to update.
     */
    where: DatacollectionSeoulRestaurantsWhereUniqueInput
  }

  /**
   * DatacollectionSeoulRestaurants updateMany
   */
  export type DatacollectionSeoulRestaurantsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatacollectionSeoulRestaurants.
     */
    data: XOR<DatacollectionSeoulRestaurantsUpdateManyMutationInput, DatacollectionSeoulRestaurantsUncheckedUpdateManyInput>
    /**
     * Filter which DatacollectionSeoulRestaurants to update
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * Limit how many DatacollectionSeoulRestaurants to update.
     */
    limit?: number
  }

  /**
   * DatacollectionSeoulRestaurants updateManyAndReturn
   */
  export type DatacollectionSeoulRestaurantsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * The data used to update DatacollectionSeoulRestaurants.
     */
    data: XOR<DatacollectionSeoulRestaurantsUpdateManyMutationInput, DatacollectionSeoulRestaurantsUncheckedUpdateManyInput>
    /**
     * Filter which DatacollectionSeoulRestaurants to update
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * Limit how many DatacollectionSeoulRestaurants to update.
     */
    limit?: number
  }

  /**
   * DatacollectionSeoulRestaurants upsert
   */
  export type DatacollectionSeoulRestaurantsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * The filter to search for the DatacollectionSeoulRestaurants to update in case it exists.
     */
    where: DatacollectionSeoulRestaurantsWhereUniqueInput
    /**
     * In case the DatacollectionSeoulRestaurants found by the `where` argument doesn't exist, create a new DatacollectionSeoulRestaurants with this data.
     */
    create: XOR<DatacollectionSeoulRestaurantsCreateInput, DatacollectionSeoulRestaurantsUncheckedCreateInput>
    /**
     * In case the DatacollectionSeoulRestaurants was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatacollectionSeoulRestaurantsUpdateInput, DatacollectionSeoulRestaurantsUncheckedUpdateInput>
  }

  /**
   * DatacollectionSeoulRestaurants delete
   */
  export type DatacollectionSeoulRestaurantsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
    /**
     * Filter which DatacollectionSeoulRestaurants to delete.
     */
    where: DatacollectionSeoulRestaurantsWhereUniqueInput
  }

  /**
   * DatacollectionSeoulRestaurants deleteMany
   */
  export type DatacollectionSeoulRestaurantsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatacollectionSeoulRestaurants to delete
     */
    where?: DatacollectionSeoulRestaurantsWhereInput
    /**
     * Limit how many DatacollectionSeoulRestaurants to delete.
     */
    limit?: number
  }

  /**
   * DatacollectionSeoulRestaurants without action
   */
  export type DatacollectionSeoulRestaurantsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatacollectionSeoulRestaurants
     */
    select?: DatacollectionSeoulRestaurantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatacollectionSeoulRestaurants
     */
    omit?: DatacollectionSeoulRestaurantsOmit<ExtArgs> | null
  }


  /**
   * Model RuleEngine
   */

  export type AggregateRuleEngine = {
    _count: RuleEngineCountAggregateOutputType | null
    _avg: RuleEngineAvgAggregateOutputType | null
    _sum: RuleEngineSumAggregateOutputType | null
    _min: RuleEngineMinAggregateOutputType | null
    _max: RuleEngineMaxAggregateOutputType | null
  }

  export type RuleEngineAvgAggregateOutputType = {
    confidence: number | null
    usageCount: number | null
    positiveCount: number | null
    negativeCount: number | null
  }

  export type RuleEngineSumAggregateOutputType = {
    confidence: number | null
    usageCount: number | null
    positiveCount: number | null
    negativeCount: number | null
  }

  export type RuleEngineMinAggregateOutputType = {
    id: string | null
    keyword: string | null
    confidence: number | null
    question: string | null
    primaryTag: string | null
    primaryAccount: string | null
    secondaryTag: string | null
    secondaryAccount: string | null
    usageCount: number | null
    positiveCount: number | null
    negativeCount: number | null
    lastUsed: Date | null
    isActive: boolean | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RuleEngineMaxAggregateOutputType = {
    id: string | null
    keyword: string | null
    confidence: number | null
    question: string | null
    primaryTag: string | null
    primaryAccount: string | null
    secondaryTag: string | null
    secondaryAccount: string | null
    usageCount: number | null
    positiveCount: number | null
    negativeCount: number | null
    lastUsed: Date | null
    isActive: boolean | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RuleEngineCountAggregateOutputType = {
    id: number
    keyword: number
    confidence: number
    question: number
    primaryTag: number
    primaryAccount: number
    secondaryTag: number
    secondaryAccount: number
    usageCount: number
    positiveCount: number
    negativeCount: number
    lastUsed: number
    isActive: number
    createdBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RuleEngineAvgAggregateInputType = {
    confidence?: true
    usageCount?: true
    positiveCount?: true
    negativeCount?: true
  }

  export type RuleEngineSumAggregateInputType = {
    confidence?: true
    usageCount?: true
    positiveCount?: true
    negativeCount?: true
  }

  export type RuleEngineMinAggregateInputType = {
    id?: true
    keyword?: true
    confidence?: true
    question?: true
    primaryTag?: true
    primaryAccount?: true
    secondaryTag?: true
    secondaryAccount?: true
    usageCount?: true
    positiveCount?: true
    negativeCount?: true
    lastUsed?: true
    isActive?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RuleEngineMaxAggregateInputType = {
    id?: true
    keyword?: true
    confidence?: true
    question?: true
    primaryTag?: true
    primaryAccount?: true
    secondaryTag?: true
    secondaryAccount?: true
    usageCount?: true
    positiveCount?: true
    negativeCount?: true
    lastUsed?: true
    isActive?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RuleEngineCountAggregateInputType = {
    id?: true
    keyword?: true
    confidence?: true
    question?: true
    primaryTag?: true
    primaryAccount?: true
    secondaryTag?: true
    secondaryAccount?: true
    usageCount?: true
    positiveCount?: true
    negativeCount?: true
    lastUsed?: true
    isActive?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RuleEngineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngine to aggregate.
     */
    where?: RuleEngineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngines to fetch.
     */
    orderBy?: RuleEngineOrderByWithRelationInput | RuleEngineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RuleEngineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RuleEngines
    **/
    _count?: true | RuleEngineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RuleEngineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RuleEngineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RuleEngineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RuleEngineMaxAggregateInputType
  }

  export type GetRuleEngineAggregateType<T extends RuleEngineAggregateArgs> = {
        [P in keyof T & keyof AggregateRuleEngine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRuleEngine[P]>
      : GetScalarType<T[P], AggregateRuleEngine[P]>
  }




  export type RuleEngineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleEngineWhereInput
    orderBy?: RuleEngineOrderByWithAggregationInput | RuleEngineOrderByWithAggregationInput[]
    by: RuleEngineScalarFieldEnum[] | RuleEngineScalarFieldEnum
    having?: RuleEngineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RuleEngineCountAggregateInputType | true
    _avg?: RuleEngineAvgAggregateInputType
    _sum?: RuleEngineSumAggregateInputType
    _min?: RuleEngineMinAggregateInputType
    _max?: RuleEngineMaxAggregateInputType
  }

  export type RuleEngineGroupByOutputType = {
    id: string
    keyword: string
    confidence: number
    question: string | null
    primaryTag: string
    primaryAccount: string
    secondaryTag: string | null
    secondaryAccount: string | null
    usageCount: number
    positiveCount: number
    negativeCount: number
    lastUsed: Date | null
    isActive: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date
    _count: RuleEngineCountAggregateOutputType | null
    _avg: RuleEngineAvgAggregateOutputType | null
    _sum: RuleEngineSumAggregateOutputType | null
    _min: RuleEngineMinAggregateOutputType | null
    _max: RuleEngineMaxAggregateOutputType | null
  }

  type GetRuleEngineGroupByPayload<T extends RuleEngineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RuleEngineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RuleEngineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleEngineGroupByOutputType[P]>
            : GetScalarType<T[P], RuleEngineGroupByOutputType[P]>
        }
      >
    >


  export type RuleEngineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    confidence?: boolean
    question?: boolean
    primaryTag?: boolean
    primaryAccount?: boolean
    secondaryTag?: boolean
    secondaryAccount?: boolean
    usageCount?: boolean
    positiveCount?: boolean
    negativeCount?: boolean
    lastUsed?: boolean
    isActive?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ruleEngine"]>

  export type RuleEngineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    confidence?: boolean
    question?: boolean
    primaryTag?: boolean
    primaryAccount?: boolean
    secondaryTag?: boolean
    secondaryAccount?: boolean
    usageCount?: boolean
    positiveCount?: boolean
    negativeCount?: boolean
    lastUsed?: boolean
    isActive?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ruleEngine"]>

  export type RuleEngineSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    confidence?: boolean
    question?: boolean
    primaryTag?: boolean
    primaryAccount?: boolean
    secondaryTag?: boolean
    secondaryAccount?: boolean
    usageCount?: boolean
    positiveCount?: boolean
    negativeCount?: boolean
    lastUsed?: boolean
    isActive?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ruleEngine"]>

  export type RuleEngineSelectScalar = {
    id?: boolean
    keyword?: boolean
    confidence?: boolean
    question?: boolean
    primaryTag?: boolean
    primaryAccount?: boolean
    secondaryTag?: boolean
    secondaryAccount?: boolean
    usageCount?: boolean
    positiveCount?: boolean
    negativeCount?: boolean
    lastUsed?: boolean
    isActive?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RuleEngineOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "keyword" | "confidence" | "question" | "primaryTag" | "primaryAccount" | "secondaryTag" | "secondaryAccount" | "usageCount" | "positiveCount" | "negativeCount" | "lastUsed" | "isActive" | "createdBy" | "createdAt" | "updatedAt", ExtArgs["result"]["ruleEngine"]>

  export type $RuleEnginePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RuleEngine"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      keyword: string
      confidence: number
      question: string | null
      primaryTag: string
      primaryAccount: string
      secondaryTag: string | null
      secondaryAccount: string | null
      usageCount: number
      positiveCount: number
      negativeCount: number
      lastUsed: Date | null
      isActive: boolean
      createdBy: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ruleEngine"]>
    composites: {}
  }

  type RuleEngineGetPayload<S extends boolean | null | undefined | RuleEngineDefaultArgs> = $Result.GetResult<Prisma.$RuleEnginePayload, S>

  type RuleEngineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RuleEngineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RuleEngineCountAggregateInputType | true
    }

  export interface RuleEngineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RuleEngine'], meta: { name: 'RuleEngine' } }
    /**
     * Find zero or one RuleEngine that matches the filter.
     * @param {RuleEngineFindUniqueArgs} args - Arguments to find a RuleEngine
     * @example
     * // Get one RuleEngine
     * const ruleEngine = await prisma.ruleEngine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleEngineFindUniqueArgs>(args: SelectSubset<T, RuleEngineFindUniqueArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RuleEngine that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleEngineFindUniqueOrThrowArgs} args - Arguments to find a RuleEngine
     * @example
     * // Get one RuleEngine
     * const ruleEngine = await prisma.ruleEngine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleEngineFindUniqueOrThrowArgs>(args: SelectSubset<T, RuleEngineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFindFirstArgs} args - Arguments to find a RuleEngine
     * @example
     * // Get one RuleEngine
     * const ruleEngine = await prisma.ruleEngine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleEngineFindFirstArgs>(args?: SelectSubset<T, RuleEngineFindFirstArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFindFirstOrThrowArgs} args - Arguments to find a RuleEngine
     * @example
     * // Get one RuleEngine
     * const ruleEngine = await prisma.ruleEngine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleEngineFindFirstOrThrowArgs>(args?: SelectSubset<T, RuleEngineFindFirstOrThrowArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RuleEngines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RuleEngines
     * const ruleEngines = await prisma.ruleEngine.findMany()
     * 
     * // Get first 10 RuleEngines
     * const ruleEngines = await prisma.ruleEngine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ruleEngineWithIdOnly = await prisma.ruleEngine.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RuleEngineFindManyArgs>(args?: SelectSubset<T, RuleEngineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RuleEngine.
     * @param {RuleEngineCreateArgs} args - Arguments to create a RuleEngine.
     * @example
     * // Create one RuleEngine
     * const RuleEngine = await prisma.ruleEngine.create({
     *   data: {
     *     // ... data to create a RuleEngine
     *   }
     * })
     * 
     */
    create<T extends RuleEngineCreateArgs>(args: SelectSubset<T, RuleEngineCreateArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RuleEngines.
     * @param {RuleEngineCreateManyArgs} args - Arguments to create many RuleEngines.
     * @example
     * // Create many RuleEngines
     * const ruleEngine = await prisma.ruleEngine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RuleEngineCreateManyArgs>(args?: SelectSubset<T, RuleEngineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RuleEngines and returns the data saved in the database.
     * @param {RuleEngineCreateManyAndReturnArgs} args - Arguments to create many RuleEngines.
     * @example
     * // Create many RuleEngines
     * const ruleEngine = await prisma.ruleEngine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RuleEngines and only return the `id`
     * const ruleEngineWithIdOnly = await prisma.ruleEngine.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RuleEngineCreateManyAndReturnArgs>(args?: SelectSubset<T, RuleEngineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RuleEngine.
     * @param {RuleEngineDeleteArgs} args - Arguments to delete one RuleEngine.
     * @example
     * // Delete one RuleEngine
     * const RuleEngine = await prisma.ruleEngine.delete({
     *   where: {
     *     // ... filter to delete one RuleEngine
     *   }
     * })
     * 
     */
    delete<T extends RuleEngineDeleteArgs>(args: SelectSubset<T, RuleEngineDeleteArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RuleEngine.
     * @param {RuleEngineUpdateArgs} args - Arguments to update one RuleEngine.
     * @example
     * // Update one RuleEngine
     * const ruleEngine = await prisma.ruleEngine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RuleEngineUpdateArgs>(args: SelectSubset<T, RuleEngineUpdateArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RuleEngines.
     * @param {RuleEngineDeleteManyArgs} args - Arguments to filter RuleEngines to delete.
     * @example
     * // Delete a few RuleEngines
     * const { count } = await prisma.ruleEngine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RuleEngineDeleteManyArgs>(args?: SelectSubset<T, RuleEngineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RuleEngines
     * const ruleEngine = await prisma.ruleEngine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RuleEngineUpdateManyArgs>(args: SelectSubset<T, RuleEngineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngines and returns the data updated in the database.
     * @param {RuleEngineUpdateManyAndReturnArgs} args - Arguments to update many RuleEngines.
     * @example
     * // Update many RuleEngines
     * const ruleEngine = await prisma.ruleEngine.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RuleEngines and only return the `id`
     * const ruleEngineWithIdOnly = await prisma.ruleEngine.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RuleEngineUpdateManyAndReturnArgs>(args: SelectSubset<T, RuleEngineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RuleEngine.
     * @param {RuleEngineUpsertArgs} args - Arguments to update or create a RuleEngine.
     * @example
     * // Update or create a RuleEngine
     * const ruleEngine = await prisma.ruleEngine.upsert({
     *   create: {
     *     // ... data to create a RuleEngine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RuleEngine we want to update
     *   }
     * })
     */
    upsert<T extends RuleEngineUpsertArgs>(args: SelectSubset<T, RuleEngineUpsertArgs<ExtArgs>>): Prisma__RuleEngineClient<$Result.GetResult<Prisma.$RuleEnginePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RuleEngines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCountArgs} args - Arguments to filter RuleEngines to count.
     * @example
     * // Count the number of RuleEngines
     * const count = await prisma.ruleEngine.count({
     *   where: {
     *     // ... the filter for the RuleEngines we want to count
     *   }
     * })
    **/
    count<T extends RuleEngineCountArgs>(
      args?: Subset<T, RuleEngineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleEngineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RuleEngine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RuleEngineAggregateArgs>(args: Subset<T, RuleEngineAggregateArgs>): Prisma.PrismaPromise<GetRuleEngineAggregateType<T>>

    /**
     * Group by RuleEngine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RuleEngineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleEngineGroupByArgs['orderBy'] }
        : { orderBy?: RuleEngineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RuleEngineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRuleEngineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RuleEngine model
   */
  readonly fields: RuleEngineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RuleEngine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleEngineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RuleEngine model
   */
  interface RuleEngineFieldRefs {
    readonly id: FieldRef<"RuleEngine", 'String'>
    readonly keyword: FieldRef<"RuleEngine", 'String'>
    readonly confidence: FieldRef<"RuleEngine", 'Int'>
    readonly question: FieldRef<"RuleEngine", 'String'>
    readonly primaryTag: FieldRef<"RuleEngine", 'String'>
    readonly primaryAccount: FieldRef<"RuleEngine", 'String'>
    readonly secondaryTag: FieldRef<"RuleEngine", 'String'>
    readonly secondaryAccount: FieldRef<"RuleEngine", 'String'>
    readonly usageCount: FieldRef<"RuleEngine", 'Int'>
    readonly positiveCount: FieldRef<"RuleEngine", 'Int'>
    readonly negativeCount: FieldRef<"RuleEngine", 'Int'>
    readonly lastUsed: FieldRef<"RuleEngine", 'DateTime'>
    readonly isActive: FieldRef<"RuleEngine", 'Boolean'>
    readonly createdBy: FieldRef<"RuleEngine", 'String'>
    readonly createdAt: FieldRef<"RuleEngine", 'DateTime'>
    readonly updatedAt: FieldRef<"RuleEngine", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RuleEngine findUnique
   */
  export type RuleEngineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngine to fetch.
     */
    where: RuleEngineWhereUniqueInput
  }

  /**
   * RuleEngine findUniqueOrThrow
   */
  export type RuleEngineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngine to fetch.
     */
    where: RuleEngineWhereUniqueInput
  }

  /**
   * RuleEngine findFirst
   */
  export type RuleEngineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngine to fetch.
     */
    where?: RuleEngineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngines to fetch.
     */
    orderBy?: RuleEngineOrderByWithRelationInput | RuleEngineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngines.
     */
    cursor?: RuleEngineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngines.
     */
    distinct?: RuleEngineScalarFieldEnum | RuleEngineScalarFieldEnum[]
  }

  /**
   * RuleEngine findFirstOrThrow
   */
  export type RuleEngineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngine to fetch.
     */
    where?: RuleEngineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngines to fetch.
     */
    orderBy?: RuleEngineOrderByWithRelationInput | RuleEngineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngines.
     */
    cursor?: RuleEngineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngines.
     */
    distinct?: RuleEngineScalarFieldEnum | RuleEngineScalarFieldEnum[]
  }

  /**
   * RuleEngine findMany
   */
  export type RuleEngineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngines to fetch.
     */
    where?: RuleEngineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngines to fetch.
     */
    orderBy?: RuleEngineOrderByWithRelationInput | RuleEngineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RuleEngines.
     */
    cursor?: RuleEngineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngines.
     */
    skip?: number
    distinct?: RuleEngineScalarFieldEnum | RuleEngineScalarFieldEnum[]
  }

  /**
   * RuleEngine create
   */
  export type RuleEngineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * The data needed to create a RuleEngine.
     */
    data: XOR<RuleEngineCreateInput, RuleEngineUncheckedCreateInput>
  }

  /**
   * RuleEngine createMany
   */
  export type RuleEngineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RuleEngines.
     */
    data: RuleEngineCreateManyInput | RuleEngineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngine createManyAndReturn
   */
  export type RuleEngineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * The data used to create many RuleEngines.
     */
    data: RuleEngineCreateManyInput | RuleEngineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngine update
   */
  export type RuleEngineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * The data needed to update a RuleEngine.
     */
    data: XOR<RuleEngineUpdateInput, RuleEngineUncheckedUpdateInput>
    /**
     * Choose, which RuleEngine to update.
     */
    where: RuleEngineWhereUniqueInput
  }

  /**
   * RuleEngine updateMany
   */
  export type RuleEngineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RuleEngines.
     */
    data: XOR<RuleEngineUpdateManyMutationInput, RuleEngineUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngines to update
     */
    where?: RuleEngineWhereInput
    /**
     * Limit how many RuleEngines to update.
     */
    limit?: number
  }

  /**
   * RuleEngine updateManyAndReturn
   */
  export type RuleEngineUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * The data used to update RuleEngines.
     */
    data: XOR<RuleEngineUpdateManyMutationInput, RuleEngineUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngines to update
     */
    where?: RuleEngineWhereInput
    /**
     * Limit how many RuleEngines to update.
     */
    limit?: number
  }

  /**
   * RuleEngine upsert
   */
  export type RuleEngineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * The filter to search for the RuleEngine to update in case it exists.
     */
    where: RuleEngineWhereUniqueInput
    /**
     * In case the RuleEngine found by the `where` argument doesn't exist, create a new RuleEngine with this data.
     */
    create: XOR<RuleEngineCreateInput, RuleEngineUncheckedCreateInput>
    /**
     * In case the RuleEngine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleEngineUpdateInput, RuleEngineUncheckedUpdateInput>
  }

  /**
   * RuleEngine delete
   */
  export type RuleEngineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
    /**
     * Filter which RuleEngine to delete.
     */
    where: RuleEngineWhereUniqueInput
  }

  /**
   * RuleEngine deleteMany
   */
  export type RuleEngineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngines to delete
     */
    where?: RuleEngineWhereInput
    /**
     * Limit how many RuleEngines to delete.
     */
    limit?: number
  }

  /**
   * RuleEngine without action
   */
  export type RuleEngineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngine
     */
    select?: RuleEngineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngine
     */
    omit?: RuleEngineOmit<ExtArgs> | null
  }


  /**
   * Model RuleEngineCandidate
   */

  export type AggregateRuleEngineCandidate = {
    _count: RuleEngineCandidateCountAggregateOutputType | null
    _avg: RuleEngineCandidateAvgAggregateOutputType | null
    _sum: RuleEngineCandidateSumAggregateOutputType | null
    _min: RuleEngineCandidateMinAggregateOutputType | null
    _max: RuleEngineCandidateMaxAggregateOutputType | null
  }

  export type RuleEngineCandidateAvgAggregateOutputType = {
    suggestionCount: number | null
    approvalThreshold: number | null
  }

  export type RuleEngineCandidateSumAggregateOutputType = {
    suggestionCount: number | null
    approvalThreshold: number | null
  }

  export type RuleEngineCandidateMinAggregateOutputType = {
    id: string | null
    keyword: string | null
    tag: string | null
    account: string | null
    suggestionCount: number | null
    approvalThreshold: number | null
    firstSuggested: Date | null
    lastSuggested: Date | null
    isApproved: boolean | null
    approvedAt: Date | null
    approvedBy: string | null
  }

  export type RuleEngineCandidateMaxAggregateOutputType = {
    id: string | null
    keyword: string | null
    tag: string | null
    account: string | null
    suggestionCount: number | null
    approvalThreshold: number | null
    firstSuggested: Date | null
    lastSuggested: Date | null
    isApproved: boolean | null
    approvedAt: Date | null
    approvedBy: string | null
  }

  export type RuleEngineCandidateCountAggregateOutputType = {
    id: number
    keyword: number
    tag: number
    account: number
    suggestionCount: number
    approvalThreshold: number
    firstSuggested: number
    lastSuggested: number
    isApproved: number
    approvedAt: number
    approvedBy: number
    _all: number
  }


  export type RuleEngineCandidateAvgAggregateInputType = {
    suggestionCount?: true
    approvalThreshold?: true
  }

  export type RuleEngineCandidateSumAggregateInputType = {
    suggestionCount?: true
    approvalThreshold?: true
  }

  export type RuleEngineCandidateMinAggregateInputType = {
    id?: true
    keyword?: true
    tag?: true
    account?: true
    suggestionCount?: true
    approvalThreshold?: true
    firstSuggested?: true
    lastSuggested?: true
    isApproved?: true
    approvedAt?: true
    approvedBy?: true
  }

  export type RuleEngineCandidateMaxAggregateInputType = {
    id?: true
    keyword?: true
    tag?: true
    account?: true
    suggestionCount?: true
    approvalThreshold?: true
    firstSuggested?: true
    lastSuggested?: true
    isApproved?: true
    approvedAt?: true
    approvedBy?: true
  }

  export type RuleEngineCandidateCountAggregateInputType = {
    id?: true
    keyword?: true
    tag?: true
    account?: true
    suggestionCount?: true
    approvalThreshold?: true
    firstSuggested?: true
    lastSuggested?: true
    isApproved?: true
    approvedAt?: true
    approvedBy?: true
    _all?: true
  }

  export type RuleEngineCandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngineCandidate to aggregate.
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineCandidates to fetch.
     */
    orderBy?: RuleEngineCandidateOrderByWithRelationInput | RuleEngineCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RuleEngineCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RuleEngineCandidates
    **/
    _count?: true | RuleEngineCandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RuleEngineCandidateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RuleEngineCandidateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RuleEngineCandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RuleEngineCandidateMaxAggregateInputType
  }

  export type GetRuleEngineCandidateAggregateType<T extends RuleEngineCandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateRuleEngineCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRuleEngineCandidate[P]>
      : GetScalarType<T[P], AggregateRuleEngineCandidate[P]>
  }




  export type RuleEngineCandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleEngineCandidateWhereInput
    orderBy?: RuleEngineCandidateOrderByWithAggregationInput | RuleEngineCandidateOrderByWithAggregationInput[]
    by: RuleEngineCandidateScalarFieldEnum[] | RuleEngineCandidateScalarFieldEnum
    having?: RuleEngineCandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RuleEngineCandidateCountAggregateInputType | true
    _avg?: RuleEngineCandidateAvgAggregateInputType
    _sum?: RuleEngineCandidateSumAggregateInputType
    _min?: RuleEngineCandidateMinAggregateInputType
    _max?: RuleEngineCandidateMaxAggregateInputType
  }

  export type RuleEngineCandidateGroupByOutputType = {
    id: string
    keyword: string
    tag: string
    account: string
    suggestionCount: number
    approvalThreshold: number
    firstSuggested: Date
    lastSuggested: Date
    isApproved: boolean
    approvedAt: Date | null
    approvedBy: string | null
    _count: RuleEngineCandidateCountAggregateOutputType | null
    _avg: RuleEngineCandidateAvgAggregateOutputType | null
    _sum: RuleEngineCandidateSumAggregateOutputType | null
    _min: RuleEngineCandidateMinAggregateOutputType | null
    _max: RuleEngineCandidateMaxAggregateOutputType | null
  }

  type GetRuleEngineCandidateGroupByPayload<T extends RuleEngineCandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RuleEngineCandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RuleEngineCandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleEngineCandidateGroupByOutputType[P]>
            : GetScalarType<T[P], RuleEngineCandidateGroupByOutputType[P]>
        }
      >
    >


  export type RuleEngineCandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    tag?: boolean
    account?: boolean
    suggestionCount?: boolean
    approvalThreshold?: boolean
    firstSuggested?: boolean
    lastSuggested?: boolean
    isApproved?: boolean
    approvedAt?: boolean
    approvedBy?: boolean
  }, ExtArgs["result"]["ruleEngineCandidate"]>

  export type RuleEngineCandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    tag?: boolean
    account?: boolean
    suggestionCount?: boolean
    approvalThreshold?: boolean
    firstSuggested?: boolean
    lastSuggested?: boolean
    isApproved?: boolean
    approvedAt?: boolean
    approvedBy?: boolean
  }, ExtArgs["result"]["ruleEngineCandidate"]>

  export type RuleEngineCandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    keyword?: boolean
    tag?: boolean
    account?: boolean
    suggestionCount?: boolean
    approvalThreshold?: boolean
    firstSuggested?: boolean
    lastSuggested?: boolean
    isApproved?: boolean
    approvedAt?: boolean
    approvedBy?: boolean
  }, ExtArgs["result"]["ruleEngineCandidate"]>

  export type RuleEngineCandidateSelectScalar = {
    id?: boolean
    keyword?: boolean
    tag?: boolean
    account?: boolean
    suggestionCount?: boolean
    approvalThreshold?: boolean
    firstSuggested?: boolean
    lastSuggested?: boolean
    isApproved?: boolean
    approvedAt?: boolean
    approvedBy?: boolean
  }

  export type RuleEngineCandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "keyword" | "tag" | "account" | "suggestionCount" | "approvalThreshold" | "firstSuggested" | "lastSuggested" | "isApproved" | "approvedAt" | "approvedBy", ExtArgs["result"]["ruleEngineCandidate"]>

  export type $RuleEngineCandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RuleEngineCandidate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      keyword: string
      tag: string
      account: string
      suggestionCount: number
      approvalThreshold: number
      firstSuggested: Date
      lastSuggested: Date
      isApproved: boolean
      approvedAt: Date | null
      approvedBy: string | null
    }, ExtArgs["result"]["ruleEngineCandidate"]>
    composites: {}
  }

  type RuleEngineCandidateGetPayload<S extends boolean | null | undefined | RuleEngineCandidateDefaultArgs> = $Result.GetResult<Prisma.$RuleEngineCandidatePayload, S>

  type RuleEngineCandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RuleEngineCandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RuleEngineCandidateCountAggregateInputType | true
    }

  export interface RuleEngineCandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RuleEngineCandidate'], meta: { name: 'RuleEngineCandidate' } }
    /**
     * Find zero or one RuleEngineCandidate that matches the filter.
     * @param {RuleEngineCandidateFindUniqueArgs} args - Arguments to find a RuleEngineCandidate
     * @example
     * // Get one RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleEngineCandidateFindUniqueArgs>(args: SelectSubset<T, RuleEngineCandidateFindUniqueArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RuleEngineCandidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleEngineCandidateFindUniqueOrThrowArgs} args - Arguments to find a RuleEngineCandidate
     * @example
     * // Get one RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleEngineCandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, RuleEngineCandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngineCandidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateFindFirstArgs} args - Arguments to find a RuleEngineCandidate
     * @example
     * // Get one RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleEngineCandidateFindFirstArgs>(args?: SelectSubset<T, RuleEngineCandidateFindFirstArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngineCandidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateFindFirstOrThrowArgs} args - Arguments to find a RuleEngineCandidate
     * @example
     * // Get one RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleEngineCandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, RuleEngineCandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RuleEngineCandidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RuleEngineCandidates
     * const ruleEngineCandidates = await prisma.ruleEngineCandidate.findMany()
     * 
     * // Get first 10 RuleEngineCandidates
     * const ruleEngineCandidates = await prisma.ruleEngineCandidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ruleEngineCandidateWithIdOnly = await prisma.ruleEngineCandidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RuleEngineCandidateFindManyArgs>(args?: SelectSubset<T, RuleEngineCandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RuleEngineCandidate.
     * @param {RuleEngineCandidateCreateArgs} args - Arguments to create a RuleEngineCandidate.
     * @example
     * // Create one RuleEngineCandidate
     * const RuleEngineCandidate = await prisma.ruleEngineCandidate.create({
     *   data: {
     *     // ... data to create a RuleEngineCandidate
     *   }
     * })
     * 
     */
    create<T extends RuleEngineCandidateCreateArgs>(args: SelectSubset<T, RuleEngineCandidateCreateArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RuleEngineCandidates.
     * @param {RuleEngineCandidateCreateManyArgs} args - Arguments to create many RuleEngineCandidates.
     * @example
     * // Create many RuleEngineCandidates
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RuleEngineCandidateCreateManyArgs>(args?: SelectSubset<T, RuleEngineCandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RuleEngineCandidates and returns the data saved in the database.
     * @param {RuleEngineCandidateCreateManyAndReturnArgs} args - Arguments to create many RuleEngineCandidates.
     * @example
     * // Create many RuleEngineCandidates
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RuleEngineCandidates and only return the `id`
     * const ruleEngineCandidateWithIdOnly = await prisma.ruleEngineCandidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RuleEngineCandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, RuleEngineCandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RuleEngineCandidate.
     * @param {RuleEngineCandidateDeleteArgs} args - Arguments to delete one RuleEngineCandidate.
     * @example
     * // Delete one RuleEngineCandidate
     * const RuleEngineCandidate = await prisma.ruleEngineCandidate.delete({
     *   where: {
     *     // ... filter to delete one RuleEngineCandidate
     *   }
     * })
     * 
     */
    delete<T extends RuleEngineCandidateDeleteArgs>(args: SelectSubset<T, RuleEngineCandidateDeleteArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RuleEngineCandidate.
     * @param {RuleEngineCandidateUpdateArgs} args - Arguments to update one RuleEngineCandidate.
     * @example
     * // Update one RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RuleEngineCandidateUpdateArgs>(args: SelectSubset<T, RuleEngineCandidateUpdateArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RuleEngineCandidates.
     * @param {RuleEngineCandidateDeleteManyArgs} args - Arguments to filter RuleEngineCandidates to delete.
     * @example
     * // Delete a few RuleEngineCandidates
     * const { count } = await prisma.ruleEngineCandidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RuleEngineCandidateDeleteManyArgs>(args?: SelectSubset<T, RuleEngineCandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngineCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RuleEngineCandidates
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RuleEngineCandidateUpdateManyArgs>(args: SelectSubset<T, RuleEngineCandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngineCandidates and returns the data updated in the database.
     * @param {RuleEngineCandidateUpdateManyAndReturnArgs} args - Arguments to update many RuleEngineCandidates.
     * @example
     * // Update many RuleEngineCandidates
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RuleEngineCandidates and only return the `id`
     * const ruleEngineCandidateWithIdOnly = await prisma.ruleEngineCandidate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RuleEngineCandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, RuleEngineCandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RuleEngineCandidate.
     * @param {RuleEngineCandidateUpsertArgs} args - Arguments to update or create a RuleEngineCandidate.
     * @example
     * // Update or create a RuleEngineCandidate
     * const ruleEngineCandidate = await prisma.ruleEngineCandidate.upsert({
     *   create: {
     *     // ... data to create a RuleEngineCandidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RuleEngineCandidate we want to update
     *   }
     * })
     */
    upsert<T extends RuleEngineCandidateUpsertArgs>(args: SelectSubset<T, RuleEngineCandidateUpsertArgs<ExtArgs>>): Prisma__RuleEngineCandidateClient<$Result.GetResult<Prisma.$RuleEngineCandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RuleEngineCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateCountArgs} args - Arguments to filter RuleEngineCandidates to count.
     * @example
     * // Count the number of RuleEngineCandidates
     * const count = await prisma.ruleEngineCandidate.count({
     *   where: {
     *     // ... the filter for the RuleEngineCandidates we want to count
     *   }
     * })
    **/
    count<T extends RuleEngineCandidateCountArgs>(
      args?: Subset<T, RuleEngineCandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleEngineCandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RuleEngineCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RuleEngineCandidateAggregateArgs>(args: Subset<T, RuleEngineCandidateAggregateArgs>): Prisma.PrismaPromise<GetRuleEngineCandidateAggregateType<T>>

    /**
     * Group by RuleEngineCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineCandidateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RuleEngineCandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleEngineCandidateGroupByArgs['orderBy'] }
        : { orderBy?: RuleEngineCandidateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RuleEngineCandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRuleEngineCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RuleEngineCandidate model
   */
  readonly fields: RuleEngineCandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RuleEngineCandidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleEngineCandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RuleEngineCandidate model
   */
  interface RuleEngineCandidateFieldRefs {
    readonly id: FieldRef<"RuleEngineCandidate", 'String'>
    readonly keyword: FieldRef<"RuleEngineCandidate", 'String'>
    readonly tag: FieldRef<"RuleEngineCandidate", 'String'>
    readonly account: FieldRef<"RuleEngineCandidate", 'String'>
    readonly suggestionCount: FieldRef<"RuleEngineCandidate", 'Int'>
    readonly approvalThreshold: FieldRef<"RuleEngineCandidate", 'Int'>
    readonly firstSuggested: FieldRef<"RuleEngineCandidate", 'DateTime'>
    readonly lastSuggested: FieldRef<"RuleEngineCandidate", 'DateTime'>
    readonly isApproved: FieldRef<"RuleEngineCandidate", 'Boolean'>
    readonly approvedAt: FieldRef<"RuleEngineCandidate", 'DateTime'>
    readonly approvedBy: FieldRef<"RuleEngineCandidate", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RuleEngineCandidate findUnique
   */
  export type RuleEngineCandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineCandidate to fetch.
     */
    where: RuleEngineCandidateWhereUniqueInput
  }

  /**
   * RuleEngineCandidate findUniqueOrThrow
   */
  export type RuleEngineCandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineCandidate to fetch.
     */
    where: RuleEngineCandidateWhereUniqueInput
  }

  /**
   * RuleEngineCandidate findFirst
   */
  export type RuleEngineCandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineCandidate to fetch.
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineCandidates to fetch.
     */
    orderBy?: RuleEngineCandidateOrderByWithRelationInput | RuleEngineCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngineCandidates.
     */
    cursor?: RuleEngineCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngineCandidates.
     */
    distinct?: RuleEngineCandidateScalarFieldEnum | RuleEngineCandidateScalarFieldEnum[]
  }

  /**
   * RuleEngineCandidate findFirstOrThrow
   */
  export type RuleEngineCandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineCandidate to fetch.
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineCandidates to fetch.
     */
    orderBy?: RuleEngineCandidateOrderByWithRelationInput | RuleEngineCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngineCandidates.
     */
    cursor?: RuleEngineCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngineCandidates.
     */
    distinct?: RuleEngineCandidateScalarFieldEnum | RuleEngineCandidateScalarFieldEnum[]
  }

  /**
   * RuleEngineCandidate findMany
   */
  export type RuleEngineCandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineCandidates to fetch.
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineCandidates to fetch.
     */
    orderBy?: RuleEngineCandidateOrderByWithRelationInput | RuleEngineCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RuleEngineCandidates.
     */
    cursor?: RuleEngineCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineCandidates.
     */
    skip?: number
    distinct?: RuleEngineCandidateScalarFieldEnum | RuleEngineCandidateScalarFieldEnum[]
  }

  /**
   * RuleEngineCandidate create
   */
  export type RuleEngineCandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * The data needed to create a RuleEngineCandidate.
     */
    data: XOR<RuleEngineCandidateCreateInput, RuleEngineCandidateUncheckedCreateInput>
  }

  /**
   * RuleEngineCandidate createMany
   */
  export type RuleEngineCandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RuleEngineCandidates.
     */
    data: RuleEngineCandidateCreateManyInput | RuleEngineCandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngineCandidate createManyAndReturn
   */
  export type RuleEngineCandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * The data used to create many RuleEngineCandidates.
     */
    data: RuleEngineCandidateCreateManyInput | RuleEngineCandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngineCandidate update
   */
  export type RuleEngineCandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * The data needed to update a RuleEngineCandidate.
     */
    data: XOR<RuleEngineCandidateUpdateInput, RuleEngineCandidateUncheckedUpdateInput>
    /**
     * Choose, which RuleEngineCandidate to update.
     */
    where: RuleEngineCandidateWhereUniqueInput
  }

  /**
   * RuleEngineCandidate updateMany
   */
  export type RuleEngineCandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RuleEngineCandidates.
     */
    data: XOR<RuleEngineCandidateUpdateManyMutationInput, RuleEngineCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngineCandidates to update
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * Limit how many RuleEngineCandidates to update.
     */
    limit?: number
  }

  /**
   * RuleEngineCandidate updateManyAndReturn
   */
  export type RuleEngineCandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * The data used to update RuleEngineCandidates.
     */
    data: XOR<RuleEngineCandidateUpdateManyMutationInput, RuleEngineCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngineCandidates to update
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * Limit how many RuleEngineCandidates to update.
     */
    limit?: number
  }

  /**
   * RuleEngineCandidate upsert
   */
  export type RuleEngineCandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * The filter to search for the RuleEngineCandidate to update in case it exists.
     */
    where: RuleEngineCandidateWhereUniqueInput
    /**
     * In case the RuleEngineCandidate found by the `where` argument doesn't exist, create a new RuleEngineCandidate with this data.
     */
    create: XOR<RuleEngineCandidateCreateInput, RuleEngineCandidateUncheckedCreateInput>
    /**
     * In case the RuleEngineCandidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleEngineCandidateUpdateInput, RuleEngineCandidateUncheckedUpdateInput>
  }

  /**
   * RuleEngineCandidate delete
   */
  export type RuleEngineCandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
    /**
     * Filter which RuleEngineCandidate to delete.
     */
    where: RuleEngineCandidateWhereUniqueInput
  }

  /**
   * RuleEngineCandidate deleteMany
   */
  export type RuleEngineCandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngineCandidates to delete
     */
    where?: RuleEngineCandidateWhereInput
    /**
     * Limit how many RuleEngineCandidates to delete.
     */
    limit?: number
  }

  /**
   * RuleEngineCandidate without action
   */
  export type RuleEngineCandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineCandidate
     */
    select?: RuleEngineCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineCandidate
     */
    omit?: RuleEngineCandidateOmit<ExtArgs> | null
  }


  /**
   * Model RuleEngineFeedback
   */

  export type AggregateRuleEngineFeedback = {
    _count: RuleEngineFeedbackCountAggregateOutputType | null
    _avg: RuleEngineFeedbackAvgAggregateOutputType | null
    _sum: RuleEngineFeedbackSumAggregateOutputType | null
    _min: RuleEngineFeedbackMinAggregateOutputType | null
    _max: RuleEngineFeedbackMaxAggregateOutputType | null
  }

  export type RuleEngineFeedbackAvgAggregateOutputType = {
    selectedOption: number | null
  }

  export type RuleEngineFeedbackSumAggregateOutputType = {
    selectedOption: number | null
  }

  export type RuleEngineFeedbackMinAggregateOutputType = {
    id: string | null
    ruleId: string | null
    transactionText: string | null
    normalizedText: string | null
    selectedOption: number | null
    selectedTag: string | null
    selectedAccount: string | null
    feedbackType: string | null
    createdAt: Date | null
  }

  export type RuleEngineFeedbackMaxAggregateOutputType = {
    id: string | null
    ruleId: string | null
    transactionText: string | null
    normalizedText: string | null
    selectedOption: number | null
    selectedTag: string | null
    selectedAccount: string | null
    feedbackType: string | null
    createdAt: Date | null
  }

  export type RuleEngineFeedbackCountAggregateOutputType = {
    id: number
    ruleId: number
    transactionText: number
    normalizedText: number
    selectedOption: number
    selectedTag: number
    selectedAccount: number
    feedbackType: number
    createdAt: number
    _all: number
  }


  export type RuleEngineFeedbackAvgAggregateInputType = {
    selectedOption?: true
  }

  export type RuleEngineFeedbackSumAggregateInputType = {
    selectedOption?: true
  }

  export type RuleEngineFeedbackMinAggregateInputType = {
    id?: true
    ruleId?: true
    transactionText?: true
    normalizedText?: true
    selectedOption?: true
    selectedTag?: true
    selectedAccount?: true
    feedbackType?: true
    createdAt?: true
  }

  export type RuleEngineFeedbackMaxAggregateInputType = {
    id?: true
    ruleId?: true
    transactionText?: true
    normalizedText?: true
    selectedOption?: true
    selectedTag?: true
    selectedAccount?: true
    feedbackType?: true
    createdAt?: true
  }

  export type RuleEngineFeedbackCountAggregateInputType = {
    id?: true
    ruleId?: true
    transactionText?: true
    normalizedText?: true
    selectedOption?: true
    selectedTag?: true
    selectedAccount?: true
    feedbackType?: true
    createdAt?: true
    _all?: true
  }

  export type RuleEngineFeedbackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngineFeedback to aggregate.
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineFeedbacks to fetch.
     */
    orderBy?: RuleEngineFeedbackOrderByWithRelationInput | RuleEngineFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RuleEngineFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RuleEngineFeedbacks
    **/
    _count?: true | RuleEngineFeedbackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RuleEngineFeedbackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RuleEngineFeedbackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RuleEngineFeedbackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RuleEngineFeedbackMaxAggregateInputType
  }

  export type GetRuleEngineFeedbackAggregateType<T extends RuleEngineFeedbackAggregateArgs> = {
        [P in keyof T & keyof AggregateRuleEngineFeedback]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRuleEngineFeedback[P]>
      : GetScalarType<T[P], AggregateRuleEngineFeedback[P]>
  }




  export type RuleEngineFeedbackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RuleEngineFeedbackWhereInput
    orderBy?: RuleEngineFeedbackOrderByWithAggregationInput | RuleEngineFeedbackOrderByWithAggregationInput[]
    by: RuleEngineFeedbackScalarFieldEnum[] | RuleEngineFeedbackScalarFieldEnum
    having?: RuleEngineFeedbackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RuleEngineFeedbackCountAggregateInputType | true
    _avg?: RuleEngineFeedbackAvgAggregateInputType
    _sum?: RuleEngineFeedbackSumAggregateInputType
    _min?: RuleEngineFeedbackMinAggregateInputType
    _max?: RuleEngineFeedbackMaxAggregateInputType
  }

  export type RuleEngineFeedbackGroupByOutputType = {
    id: string
    ruleId: string | null
    transactionText: string
    normalizedText: string
    selectedOption: number
    selectedTag: string
    selectedAccount: string
    feedbackType: string
    createdAt: Date
    _count: RuleEngineFeedbackCountAggregateOutputType | null
    _avg: RuleEngineFeedbackAvgAggregateOutputType | null
    _sum: RuleEngineFeedbackSumAggregateOutputType | null
    _min: RuleEngineFeedbackMinAggregateOutputType | null
    _max: RuleEngineFeedbackMaxAggregateOutputType | null
  }

  type GetRuleEngineFeedbackGroupByPayload<T extends RuleEngineFeedbackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RuleEngineFeedbackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RuleEngineFeedbackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleEngineFeedbackGroupByOutputType[P]>
            : GetScalarType<T[P], RuleEngineFeedbackGroupByOutputType[P]>
        }
      >
    >


  export type RuleEngineFeedbackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ruleId?: boolean
    transactionText?: boolean
    normalizedText?: boolean
    selectedOption?: boolean
    selectedTag?: boolean
    selectedAccount?: boolean
    feedbackType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ruleEngineFeedback"]>

  export type RuleEngineFeedbackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ruleId?: boolean
    transactionText?: boolean
    normalizedText?: boolean
    selectedOption?: boolean
    selectedTag?: boolean
    selectedAccount?: boolean
    feedbackType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ruleEngineFeedback"]>

  export type RuleEngineFeedbackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ruleId?: boolean
    transactionText?: boolean
    normalizedText?: boolean
    selectedOption?: boolean
    selectedTag?: boolean
    selectedAccount?: boolean
    feedbackType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ruleEngineFeedback"]>

  export type RuleEngineFeedbackSelectScalar = {
    id?: boolean
    ruleId?: boolean
    transactionText?: boolean
    normalizedText?: boolean
    selectedOption?: boolean
    selectedTag?: boolean
    selectedAccount?: boolean
    feedbackType?: boolean
    createdAt?: boolean
  }

  export type RuleEngineFeedbackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ruleId" | "transactionText" | "normalizedText" | "selectedOption" | "selectedTag" | "selectedAccount" | "feedbackType" | "createdAt", ExtArgs["result"]["ruleEngineFeedback"]>

  export type $RuleEngineFeedbackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RuleEngineFeedback"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ruleId: string | null
      transactionText: string
      normalizedText: string
      selectedOption: number
      selectedTag: string
      selectedAccount: string
      feedbackType: string
      createdAt: Date
    }, ExtArgs["result"]["ruleEngineFeedback"]>
    composites: {}
  }

  type RuleEngineFeedbackGetPayload<S extends boolean | null | undefined | RuleEngineFeedbackDefaultArgs> = $Result.GetResult<Prisma.$RuleEngineFeedbackPayload, S>

  type RuleEngineFeedbackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RuleEngineFeedbackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RuleEngineFeedbackCountAggregateInputType | true
    }

  export interface RuleEngineFeedbackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RuleEngineFeedback'], meta: { name: 'RuleEngineFeedback' } }
    /**
     * Find zero or one RuleEngineFeedback that matches the filter.
     * @param {RuleEngineFeedbackFindUniqueArgs} args - Arguments to find a RuleEngineFeedback
     * @example
     * // Get one RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleEngineFeedbackFindUniqueArgs>(args: SelectSubset<T, RuleEngineFeedbackFindUniqueArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RuleEngineFeedback that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleEngineFeedbackFindUniqueOrThrowArgs} args - Arguments to find a RuleEngineFeedback
     * @example
     * // Get one RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleEngineFeedbackFindUniqueOrThrowArgs>(args: SelectSubset<T, RuleEngineFeedbackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngineFeedback that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackFindFirstArgs} args - Arguments to find a RuleEngineFeedback
     * @example
     * // Get one RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleEngineFeedbackFindFirstArgs>(args?: SelectSubset<T, RuleEngineFeedbackFindFirstArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RuleEngineFeedback that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackFindFirstOrThrowArgs} args - Arguments to find a RuleEngineFeedback
     * @example
     * // Get one RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleEngineFeedbackFindFirstOrThrowArgs>(args?: SelectSubset<T, RuleEngineFeedbackFindFirstOrThrowArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RuleEngineFeedbacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RuleEngineFeedbacks
     * const ruleEngineFeedbacks = await prisma.ruleEngineFeedback.findMany()
     * 
     * // Get first 10 RuleEngineFeedbacks
     * const ruleEngineFeedbacks = await prisma.ruleEngineFeedback.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ruleEngineFeedbackWithIdOnly = await prisma.ruleEngineFeedback.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RuleEngineFeedbackFindManyArgs>(args?: SelectSubset<T, RuleEngineFeedbackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RuleEngineFeedback.
     * @param {RuleEngineFeedbackCreateArgs} args - Arguments to create a RuleEngineFeedback.
     * @example
     * // Create one RuleEngineFeedback
     * const RuleEngineFeedback = await prisma.ruleEngineFeedback.create({
     *   data: {
     *     // ... data to create a RuleEngineFeedback
     *   }
     * })
     * 
     */
    create<T extends RuleEngineFeedbackCreateArgs>(args: SelectSubset<T, RuleEngineFeedbackCreateArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RuleEngineFeedbacks.
     * @param {RuleEngineFeedbackCreateManyArgs} args - Arguments to create many RuleEngineFeedbacks.
     * @example
     * // Create many RuleEngineFeedbacks
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RuleEngineFeedbackCreateManyArgs>(args?: SelectSubset<T, RuleEngineFeedbackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RuleEngineFeedbacks and returns the data saved in the database.
     * @param {RuleEngineFeedbackCreateManyAndReturnArgs} args - Arguments to create many RuleEngineFeedbacks.
     * @example
     * // Create many RuleEngineFeedbacks
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RuleEngineFeedbacks and only return the `id`
     * const ruleEngineFeedbackWithIdOnly = await prisma.ruleEngineFeedback.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RuleEngineFeedbackCreateManyAndReturnArgs>(args?: SelectSubset<T, RuleEngineFeedbackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RuleEngineFeedback.
     * @param {RuleEngineFeedbackDeleteArgs} args - Arguments to delete one RuleEngineFeedback.
     * @example
     * // Delete one RuleEngineFeedback
     * const RuleEngineFeedback = await prisma.ruleEngineFeedback.delete({
     *   where: {
     *     // ... filter to delete one RuleEngineFeedback
     *   }
     * })
     * 
     */
    delete<T extends RuleEngineFeedbackDeleteArgs>(args: SelectSubset<T, RuleEngineFeedbackDeleteArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RuleEngineFeedback.
     * @param {RuleEngineFeedbackUpdateArgs} args - Arguments to update one RuleEngineFeedback.
     * @example
     * // Update one RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RuleEngineFeedbackUpdateArgs>(args: SelectSubset<T, RuleEngineFeedbackUpdateArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RuleEngineFeedbacks.
     * @param {RuleEngineFeedbackDeleteManyArgs} args - Arguments to filter RuleEngineFeedbacks to delete.
     * @example
     * // Delete a few RuleEngineFeedbacks
     * const { count } = await prisma.ruleEngineFeedback.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RuleEngineFeedbackDeleteManyArgs>(args?: SelectSubset<T, RuleEngineFeedbackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngineFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RuleEngineFeedbacks
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RuleEngineFeedbackUpdateManyArgs>(args: SelectSubset<T, RuleEngineFeedbackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RuleEngineFeedbacks and returns the data updated in the database.
     * @param {RuleEngineFeedbackUpdateManyAndReturnArgs} args - Arguments to update many RuleEngineFeedbacks.
     * @example
     * // Update many RuleEngineFeedbacks
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RuleEngineFeedbacks and only return the `id`
     * const ruleEngineFeedbackWithIdOnly = await prisma.ruleEngineFeedback.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RuleEngineFeedbackUpdateManyAndReturnArgs>(args: SelectSubset<T, RuleEngineFeedbackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RuleEngineFeedback.
     * @param {RuleEngineFeedbackUpsertArgs} args - Arguments to update or create a RuleEngineFeedback.
     * @example
     * // Update or create a RuleEngineFeedback
     * const ruleEngineFeedback = await prisma.ruleEngineFeedback.upsert({
     *   create: {
     *     // ... data to create a RuleEngineFeedback
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RuleEngineFeedback we want to update
     *   }
     * })
     */
    upsert<T extends RuleEngineFeedbackUpsertArgs>(args: SelectSubset<T, RuleEngineFeedbackUpsertArgs<ExtArgs>>): Prisma__RuleEngineFeedbackClient<$Result.GetResult<Prisma.$RuleEngineFeedbackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RuleEngineFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackCountArgs} args - Arguments to filter RuleEngineFeedbacks to count.
     * @example
     * // Count the number of RuleEngineFeedbacks
     * const count = await prisma.ruleEngineFeedback.count({
     *   where: {
     *     // ... the filter for the RuleEngineFeedbacks we want to count
     *   }
     * })
    **/
    count<T extends RuleEngineFeedbackCountArgs>(
      args?: Subset<T, RuleEngineFeedbackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleEngineFeedbackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RuleEngineFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RuleEngineFeedbackAggregateArgs>(args: Subset<T, RuleEngineFeedbackAggregateArgs>): Prisma.PrismaPromise<GetRuleEngineFeedbackAggregateType<T>>

    /**
     * Group by RuleEngineFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleEngineFeedbackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RuleEngineFeedbackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleEngineFeedbackGroupByArgs['orderBy'] }
        : { orderBy?: RuleEngineFeedbackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RuleEngineFeedbackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRuleEngineFeedbackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RuleEngineFeedback model
   */
  readonly fields: RuleEngineFeedbackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RuleEngineFeedback.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleEngineFeedbackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RuleEngineFeedback model
   */
  interface RuleEngineFeedbackFieldRefs {
    readonly id: FieldRef<"RuleEngineFeedback", 'String'>
    readonly ruleId: FieldRef<"RuleEngineFeedback", 'String'>
    readonly transactionText: FieldRef<"RuleEngineFeedback", 'String'>
    readonly normalizedText: FieldRef<"RuleEngineFeedback", 'String'>
    readonly selectedOption: FieldRef<"RuleEngineFeedback", 'Int'>
    readonly selectedTag: FieldRef<"RuleEngineFeedback", 'String'>
    readonly selectedAccount: FieldRef<"RuleEngineFeedback", 'String'>
    readonly feedbackType: FieldRef<"RuleEngineFeedback", 'String'>
    readonly createdAt: FieldRef<"RuleEngineFeedback", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RuleEngineFeedback findUnique
   */
  export type RuleEngineFeedbackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineFeedback to fetch.
     */
    where: RuleEngineFeedbackWhereUniqueInput
  }

  /**
   * RuleEngineFeedback findUniqueOrThrow
   */
  export type RuleEngineFeedbackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineFeedback to fetch.
     */
    where: RuleEngineFeedbackWhereUniqueInput
  }

  /**
   * RuleEngineFeedback findFirst
   */
  export type RuleEngineFeedbackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineFeedback to fetch.
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineFeedbacks to fetch.
     */
    orderBy?: RuleEngineFeedbackOrderByWithRelationInput | RuleEngineFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngineFeedbacks.
     */
    cursor?: RuleEngineFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngineFeedbacks.
     */
    distinct?: RuleEngineFeedbackScalarFieldEnum | RuleEngineFeedbackScalarFieldEnum[]
  }

  /**
   * RuleEngineFeedback findFirstOrThrow
   */
  export type RuleEngineFeedbackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineFeedback to fetch.
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineFeedbacks to fetch.
     */
    orderBy?: RuleEngineFeedbackOrderByWithRelationInput | RuleEngineFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RuleEngineFeedbacks.
     */
    cursor?: RuleEngineFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RuleEngineFeedbacks.
     */
    distinct?: RuleEngineFeedbackScalarFieldEnum | RuleEngineFeedbackScalarFieldEnum[]
  }

  /**
   * RuleEngineFeedback findMany
   */
  export type RuleEngineFeedbackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which RuleEngineFeedbacks to fetch.
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RuleEngineFeedbacks to fetch.
     */
    orderBy?: RuleEngineFeedbackOrderByWithRelationInput | RuleEngineFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RuleEngineFeedbacks.
     */
    cursor?: RuleEngineFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RuleEngineFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RuleEngineFeedbacks.
     */
    skip?: number
    distinct?: RuleEngineFeedbackScalarFieldEnum | RuleEngineFeedbackScalarFieldEnum[]
  }

  /**
   * RuleEngineFeedback create
   */
  export type RuleEngineFeedbackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * The data needed to create a RuleEngineFeedback.
     */
    data: XOR<RuleEngineFeedbackCreateInput, RuleEngineFeedbackUncheckedCreateInput>
  }

  /**
   * RuleEngineFeedback createMany
   */
  export type RuleEngineFeedbackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RuleEngineFeedbacks.
     */
    data: RuleEngineFeedbackCreateManyInput | RuleEngineFeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngineFeedback createManyAndReturn
   */
  export type RuleEngineFeedbackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * The data used to create many RuleEngineFeedbacks.
     */
    data: RuleEngineFeedbackCreateManyInput | RuleEngineFeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RuleEngineFeedback update
   */
  export type RuleEngineFeedbackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * The data needed to update a RuleEngineFeedback.
     */
    data: XOR<RuleEngineFeedbackUpdateInput, RuleEngineFeedbackUncheckedUpdateInput>
    /**
     * Choose, which RuleEngineFeedback to update.
     */
    where: RuleEngineFeedbackWhereUniqueInput
  }

  /**
   * RuleEngineFeedback updateMany
   */
  export type RuleEngineFeedbackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RuleEngineFeedbacks.
     */
    data: XOR<RuleEngineFeedbackUpdateManyMutationInput, RuleEngineFeedbackUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngineFeedbacks to update
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * Limit how many RuleEngineFeedbacks to update.
     */
    limit?: number
  }

  /**
   * RuleEngineFeedback updateManyAndReturn
   */
  export type RuleEngineFeedbackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * The data used to update RuleEngineFeedbacks.
     */
    data: XOR<RuleEngineFeedbackUpdateManyMutationInput, RuleEngineFeedbackUncheckedUpdateManyInput>
    /**
     * Filter which RuleEngineFeedbacks to update
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * Limit how many RuleEngineFeedbacks to update.
     */
    limit?: number
  }

  /**
   * RuleEngineFeedback upsert
   */
  export type RuleEngineFeedbackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * The filter to search for the RuleEngineFeedback to update in case it exists.
     */
    where: RuleEngineFeedbackWhereUniqueInput
    /**
     * In case the RuleEngineFeedback found by the `where` argument doesn't exist, create a new RuleEngineFeedback with this data.
     */
    create: XOR<RuleEngineFeedbackCreateInput, RuleEngineFeedbackUncheckedCreateInput>
    /**
     * In case the RuleEngineFeedback was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleEngineFeedbackUpdateInput, RuleEngineFeedbackUncheckedUpdateInput>
  }

  /**
   * RuleEngineFeedback delete
   */
  export type RuleEngineFeedbackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
    /**
     * Filter which RuleEngineFeedback to delete.
     */
    where: RuleEngineFeedbackWhereUniqueInput
  }

  /**
   * RuleEngineFeedback deleteMany
   */
  export type RuleEngineFeedbackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RuleEngineFeedbacks to delete
     */
    where?: RuleEngineFeedbackWhereInput
    /**
     * Limit how many RuleEngineFeedbacks to delete.
     */
    limit?: number
  }

  /**
   * RuleEngineFeedback without action
   */
  export type RuleEngineFeedbackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RuleEngineFeedback
     */
    select?: RuleEngineFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RuleEngineFeedback
     */
    omit?: RuleEngineFeedbackOmit<ExtArgs> | null
  }


  /**
   * Model FranchiseBrands
   */

  export type AggregateFranchiseBrands = {
    _count: FranchiseBrandsCountAggregateOutputType | null
    _avg: FranchiseBrandsAvgAggregateOutputType | null
    _sum: FranchiseBrandsSumAggregateOutputType | null
    _min: FranchiseBrandsMinAggregateOutputType | null
    _max: FranchiseBrandsMaxAggregateOutputType | null
  }

  export type FranchiseBrandsAvgAggregateOutputType = {
    id: number | null
  }

  export type FranchiseBrandsSumAggregateOutputType = {
    id: number | null
  }

  export type FranchiseBrandsMinAggregateOutputType = {
    id: number | null
    businessYear: string | null
    brandId: string | null
    headquartersId: string | null
    businessRegistrationNumber: string | null
    corporateRegistrationNumber: string | null
    representativeName: string | null
    brandName: string | null
    industryLargeCategory: string | null
    industryMediumCategory: string | null
    mainProduct: string | null
    businessStartDate: Date | null
    companyName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FranchiseBrandsMaxAggregateOutputType = {
    id: number | null
    businessYear: string | null
    brandId: string | null
    headquartersId: string | null
    businessRegistrationNumber: string | null
    corporateRegistrationNumber: string | null
    representativeName: string | null
    brandName: string | null
    industryLargeCategory: string | null
    industryMediumCategory: string | null
    mainProduct: string | null
    businessStartDate: Date | null
    companyName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FranchiseBrandsCountAggregateOutputType = {
    id: number
    businessYear: number
    brandId: number
    headquartersId: number
    businessRegistrationNumber: number
    corporateRegistrationNumber: number
    representativeName: number
    brandName: number
    industryLargeCategory: number
    industryMediumCategory: number
    mainProduct: number
    businessStartDate: number
    companyName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FranchiseBrandsAvgAggregateInputType = {
    id?: true
  }

  export type FranchiseBrandsSumAggregateInputType = {
    id?: true
  }

  export type FranchiseBrandsMinAggregateInputType = {
    id?: true
    businessYear?: true
    brandId?: true
    headquartersId?: true
    businessRegistrationNumber?: true
    corporateRegistrationNumber?: true
    representativeName?: true
    brandName?: true
    industryLargeCategory?: true
    industryMediumCategory?: true
    mainProduct?: true
    businessStartDate?: true
    companyName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FranchiseBrandsMaxAggregateInputType = {
    id?: true
    businessYear?: true
    brandId?: true
    headquartersId?: true
    businessRegistrationNumber?: true
    corporateRegistrationNumber?: true
    representativeName?: true
    brandName?: true
    industryLargeCategory?: true
    industryMediumCategory?: true
    mainProduct?: true
    businessStartDate?: true
    companyName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FranchiseBrandsCountAggregateInputType = {
    id?: true
    businessYear?: true
    brandId?: true
    headquartersId?: true
    businessRegistrationNumber?: true
    corporateRegistrationNumber?: true
    representativeName?: true
    brandName?: true
    industryLargeCategory?: true
    industryMediumCategory?: true
    mainProduct?: true
    businessStartDate?: true
    companyName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FranchiseBrandsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FranchiseBrands to aggregate.
     */
    where?: FranchiseBrandsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FranchiseBrands to fetch.
     */
    orderBy?: FranchiseBrandsOrderByWithRelationInput | FranchiseBrandsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FranchiseBrandsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FranchiseBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FranchiseBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FranchiseBrands
    **/
    _count?: true | FranchiseBrandsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FranchiseBrandsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FranchiseBrandsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FranchiseBrandsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FranchiseBrandsMaxAggregateInputType
  }

  export type GetFranchiseBrandsAggregateType<T extends FranchiseBrandsAggregateArgs> = {
        [P in keyof T & keyof AggregateFranchiseBrands]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFranchiseBrands[P]>
      : GetScalarType<T[P], AggregateFranchiseBrands[P]>
  }




  export type FranchiseBrandsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FranchiseBrandsWhereInput
    orderBy?: FranchiseBrandsOrderByWithAggregationInput | FranchiseBrandsOrderByWithAggregationInput[]
    by: FranchiseBrandsScalarFieldEnum[] | FranchiseBrandsScalarFieldEnum
    having?: FranchiseBrandsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FranchiseBrandsCountAggregateInputType | true
    _avg?: FranchiseBrandsAvgAggregateInputType
    _sum?: FranchiseBrandsSumAggregateInputType
    _min?: FranchiseBrandsMinAggregateInputType
    _max?: FranchiseBrandsMaxAggregateInputType
  }

  export type FranchiseBrandsGroupByOutputType = {
    id: number
    businessYear: string
    brandId: string
    headquartersId: string | null
    businessRegistrationNumber: string | null
    corporateRegistrationNumber: string | null
    representativeName: string | null
    brandName: string
    industryLargeCategory: string | null
    industryMediumCategory: string | null
    mainProduct: string | null
    businessStartDate: Date | null
    companyName: string | null
    createdAt: Date
    updatedAt: Date
    _count: FranchiseBrandsCountAggregateOutputType | null
    _avg: FranchiseBrandsAvgAggregateOutputType | null
    _sum: FranchiseBrandsSumAggregateOutputType | null
    _min: FranchiseBrandsMinAggregateOutputType | null
    _max: FranchiseBrandsMaxAggregateOutputType | null
  }

  type GetFranchiseBrandsGroupByPayload<T extends FranchiseBrandsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FranchiseBrandsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FranchiseBrandsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FranchiseBrandsGroupByOutputType[P]>
            : GetScalarType<T[P], FranchiseBrandsGroupByOutputType[P]>
        }
      >
    >


  export type FranchiseBrandsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessYear?: boolean
    brandId?: boolean
    headquartersId?: boolean
    businessRegistrationNumber?: boolean
    corporateRegistrationNumber?: boolean
    representativeName?: boolean
    brandName?: boolean
    industryLargeCategory?: boolean
    industryMediumCategory?: boolean
    mainProduct?: boolean
    businessStartDate?: boolean
    companyName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["franchiseBrands"]>

  export type FranchiseBrandsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessYear?: boolean
    brandId?: boolean
    headquartersId?: boolean
    businessRegistrationNumber?: boolean
    corporateRegistrationNumber?: boolean
    representativeName?: boolean
    brandName?: boolean
    industryLargeCategory?: boolean
    industryMediumCategory?: boolean
    mainProduct?: boolean
    businessStartDate?: boolean
    companyName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["franchiseBrands"]>

  export type FranchiseBrandsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessYear?: boolean
    brandId?: boolean
    headquartersId?: boolean
    businessRegistrationNumber?: boolean
    corporateRegistrationNumber?: boolean
    representativeName?: boolean
    brandName?: boolean
    industryLargeCategory?: boolean
    industryMediumCategory?: boolean
    mainProduct?: boolean
    businessStartDate?: boolean
    companyName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["franchiseBrands"]>

  export type FranchiseBrandsSelectScalar = {
    id?: boolean
    businessYear?: boolean
    brandId?: boolean
    headquartersId?: boolean
    businessRegistrationNumber?: boolean
    corporateRegistrationNumber?: boolean
    representativeName?: boolean
    brandName?: boolean
    industryLargeCategory?: boolean
    industryMediumCategory?: boolean
    mainProduct?: boolean
    businessStartDate?: boolean
    companyName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FranchiseBrandsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "businessYear" | "brandId" | "headquartersId" | "businessRegistrationNumber" | "corporateRegistrationNumber" | "representativeName" | "brandName" | "industryLargeCategory" | "industryMediumCategory" | "mainProduct" | "businessStartDate" | "companyName" | "createdAt" | "updatedAt", ExtArgs["result"]["franchiseBrands"]>

  export type $FranchiseBrandsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FranchiseBrands"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      businessYear: string
      brandId: string
      headquartersId: string | null
      businessRegistrationNumber: string | null
      corporateRegistrationNumber: string | null
      representativeName: string | null
      brandName: string
      industryLargeCategory: string | null
      industryMediumCategory: string | null
      mainProduct: string | null
      businessStartDate: Date | null
      companyName: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["franchiseBrands"]>
    composites: {}
  }

  type FranchiseBrandsGetPayload<S extends boolean | null | undefined | FranchiseBrandsDefaultArgs> = $Result.GetResult<Prisma.$FranchiseBrandsPayload, S>

  type FranchiseBrandsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FranchiseBrandsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FranchiseBrandsCountAggregateInputType | true
    }

  export interface FranchiseBrandsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FranchiseBrands'], meta: { name: 'FranchiseBrands' } }
    /**
     * Find zero or one FranchiseBrands that matches the filter.
     * @param {FranchiseBrandsFindUniqueArgs} args - Arguments to find a FranchiseBrands
     * @example
     * // Get one FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FranchiseBrandsFindUniqueArgs>(args: SelectSubset<T, FranchiseBrandsFindUniqueArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FranchiseBrands that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FranchiseBrandsFindUniqueOrThrowArgs} args - Arguments to find a FranchiseBrands
     * @example
     * // Get one FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FranchiseBrandsFindUniqueOrThrowArgs>(args: SelectSubset<T, FranchiseBrandsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FranchiseBrands that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsFindFirstArgs} args - Arguments to find a FranchiseBrands
     * @example
     * // Get one FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FranchiseBrandsFindFirstArgs>(args?: SelectSubset<T, FranchiseBrandsFindFirstArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FranchiseBrands that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsFindFirstOrThrowArgs} args - Arguments to find a FranchiseBrands
     * @example
     * // Get one FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FranchiseBrandsFindFirstOrThrowArgs>(args?: SelectSubset<T, FranchiseBrandsFindFirstOrThrowArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FranchiseBrands that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findMany()
     * 
     * // Get first 10 FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const franchiseBrandsWithIdOnly = await prisma.franchiseBrands.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FranchiseBrandsFindManyArgs>(args?: SelectSubset<T, FranchiseBrandsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FranchiseBrands.
     * @param {FranchiseBrandsCreateArgs} args - Arguments to create a FranchiseBrands.
     * @example
     * // Create one FranchiseBrands
     * const FranchiseBrands = await prisma.franchiseBrands.create({
     *   data: {
     *     // ... data to create a FranchiseBrands
     *   }
     * })
     * 
     */
    create<T extends FranchiseBrandsCreateArgs>(args: SelectSubset<T, FranchiseBrandsCreateArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FranchiseBrands.
     * @param {FranchiseBrandsCreateManyArgs} args - Arguments to create many FranchiseBrands.
     * @example
     * // Create many FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FranchiseBrandsCreateManyArgs>(args?: SelectSubset<T, FranchiseBrandsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FranchiseBrands and returns the data saved in the database.
     * @param {FranchiseBrandsCreateManyAndReturnArgs} args - Arguments to create many FranchiseBrands.
     * @example
     * // Create many FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FranchiseBrands and only return the `id`
     * const franchiseBrandsWithIdOnly = await prisma.franchiseBrands.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FranchiseBrandsCreateManyAndReturnArgs>(args?: SelectSubset<T, FranchiseBrandsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FranchiseBrands.
     * @param {FranchiseBrandsDeleteArgs} args - Arguments to delete one FranchiseBrands.
     * @example
     * // Delete one FranchiseBrands
     * const FranchiseBrands = await prisma.franchiseBrands.delete({
     *   where: {
     *     // ... filter to delete one FranchiseBrands
     *   }
     * })
     * 
     */
    delete<T extends FranchiseBrandsDeleteArgs>(args: SelectSubset<T, FranchiseBrandsDeleteArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FranchiseBrands.
     * @param {FranchiseBrandsUpdateArgs} args - Arguments to update one FranchiseBrands.
     * @example
     * // Update one FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FranchiseBrandsUpdateArgs>(args: SelectSubset<T, FranchiseBrandsUpdateArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FranchiseBrands.
     * @param {FranchiseBrandsDeleteManyArgs} args - Arguments to filter FranchiseBrands to delete.
     * @example
     * // Delete a few FranchiseBrands
     * const { count } = await prisma.franchiseBrands.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FranchiseBrandsDeleteManyArgs>(args?: SelectSubset<T, FranchiseBrandsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FranchiseBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FranchiseBrandsUpdateManyArgs>(args: SelectSubset<T, FranchiseBrandsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FranchiseBrands and returns the data updated in the database.
     * @param {FranchiseBrandsUpdateManyAndReturnArgs} args - Arguments to update many FranchiseBrands.
     * @example
     * // Update many FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FranchiseBrands and only return the `id`
     * const franchiseBrandsWithIdOnly = await prisma.franchiseBrands.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FranchiseBrandsUpdateManyAndReturnArgs>(args: SelectSubset<T, FranchiseBrandsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FranchiseBrands.
     * @param {FranchiseBrandsUpsertArgs} args - Arguments to update or create a FranchiseBrands.
     * @example
     * // Update or create a FranchiseBrands
     * const franchiseBrands = await prisma.franchiseBrands.upsert({
     *   create: {
     *     // ... data to create a FranchiseBrands
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FranchiseBrands we want to update
     *   }
     * })
     */
    upsert<T extends FranchiseBrandsUpsertArgs>(args: SelectSubset<T, FranchiseBrandsUpsertArgs<ExtArgs>>): Prisma__FranchiseBrandsClient<$Result.GetResult<Prisma.$FranchiseBrandsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FranchiseBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsCountArgs} args - Arguments to filter FranchiseBrands to count.
     * @example
     * // Count the number of FranchiseBrands
     * const count = await prisma.franchiseBrands.count({
     *   where: {
     *     // ... the filter for the FranchiseBrands we want to count
     *   }
     * })
    **/
    count<T extends FranchiseBrandsCountArgs>(
      args?: Subset<T, FranchiseBrandsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FranchiseBrandsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FranchiseBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FranchiseBrandsAggregateArgs>(args: Subset<T, FranchiseBrandsAggregateArgs>): Prisma.PrismaPromise<GetFranchiseBrandsAggregateType<T>>

    /**
     * Group by FranchiseBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FranchiseBrandsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FranchiseBrandsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FranchiseBrandsGroupByArgs['orderBy'] }
        : { orderBy?: FranchiseBrandsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FranchiseBrandsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFranchiseBrandsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FranchiseBrands model
   */
  readonly fields: FranchiseBrandsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FranchiseBrands.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FranchiseBrandsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FranchiseBrands model
   */
  interface FranchiseBrandsFieldRefs {
    readonly id: FieldRef<"FranchiseBrands", 'Int'>
    readonly businessYear: FieldRef<"FranchiseBrands", 'String'>
    readonly brandId: FieldRef<"FranchiseBrands", 'String'>
    readonly headquartersId: FieldRef<"FranchiseBrands", 'String'>
    readonly businessRegistrationNumber: FieldRef<"FranchiseBrands", 'String'>
    readonly corporateRegistrationNumber: FieldRef<"FranchiseBrands", 'String'>
    readonly representativeName: FieldRef<"FranchiseBrands", 'String'>
    readonly brandName: FieldRef<"FranchiseBrands", 'String'>
    readonly industryLargeCategory: FieldRef<"FranchiseBrands", 'String'>
    readonly industryMediumCategory: FieldRef<"FranchiseBrands", 'String'>
    readonly mainProduct: FieldRef<"FranchiseBrands", 'String'>
    readonly businessStartDate: FieldRef<"FranchiseBrands", 'DateTime'>
    readonly companyName: FieldRef<"FranchiseBrands", 'String'>
    readonly createdAt: FieldRef<"FranchiseBrands", 'DateTime'>
    readonly updatedAt: FieldRef<"FranchiseBrands", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FranchiseBrands findUnique
   */
  export type FranchiseBrandsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter, which FranchiseBrands to fetch.
     */
    where: FranchiseBrandsWhereUniqueInput
  }

  /**
   * FranchiseBrands findUniqueOrThrow
   */
  export type FranchiseBrandsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter, which FranchiseBrands to fetch.
     */
    where: FranchiseBrandsWhereUniqueInput
  }

  /**
   * FranchiseBrands findFirst
   */
  export type FranchiseBrandsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter, which FranchiseBrands to fetch.
     */
    where?: FranchiseBrandsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FranchiseBrands to fetch.
     */
    orderBy?: FranchiseBrandsOrderByWithRelationInput | FranchiseBrandsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FranchiseBrands.
     */
    cursor?: FranchiseBrandsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FranchiseBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FranchiseBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FranchiseBrands.
     */
    distinct?: FranchiseBrandsScalarFieldEnum | FranchiseBrandsScalarFieldEnum[]
  }

  /**
   * FranchiseBrands findFirstOrThrow
   */
  export type FranchiseBrandsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter, which FranchiseBrands to fetch.
     */
    where?: FranchiseBrandsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FranchiseBrands to fetch.
     */
    orderBy?: FranchiseBrandsOrderByWithRelationInput | FranchiseBrandsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FranchiseBrands.
     */
    cursor?: FranchiseBrandsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FranchiseBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FranchiseBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FranchiseBrands.
     */
    distinct?: FranchiseBrandsScalarFieldEnum | FranchiseBrandsScalarFieldEnum[]
  }

  /**
   * FranchiseBrands findMany
   */
  export type FranchiseBrandsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter, which FranchiseBrands to fetch.
     */
    where?: FranchiseBrandsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FranchiseBrands to fetch.
     */
    orderBy?: FranchiseBrandsOrderByWithRelationInput | FranchiseBrandsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FranchiseBrands.
     */
    cursor?: FranchiseBrandsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FranchiseBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FranchiseBrands.
     */
    skip?: number
    distinct?: FranchiseBrandsScalarFieldEnum | FranchiseBrandsScalarFieldEnum[]
  }

  /**
   * FranchiseBrands create
   */
  export type FranchiseBrandsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * The data needed to create a FranchiseBrands.
     */
    data: XOR<FranchiseBrandsCreateInput, FranchiseBrandsUncheckedCreateInput>
  }

  /**
   * FranchiseBrands createMany
   */
  export type FranchiseBrandsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FranchiseBrands.
     */
    data: FranchiseBrandsCreateManyInput | FranchiseBrandsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FranchiseBrands createManyAndReturn
   */
  export type FranchiseBrandsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * The data used to create many FranchiseBrands.
     */
    data: FranchiseBrandsCreateManyInput | FranchiseBrandsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FranchiseBrands update
   */
  export type FranchiseBrandsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * The data needed to update a FranchiseBrands.
     */
    data: XOR<FranchiseBrandsUpdateInput, FranchiseBrandsUncheckedUpdateInput>
    /**
     * Choose, which FranchiseBrands to update.
     */
    where: FranchiseBrandsWhereUniqueInput
  }

  /**
   * FranchiseBrands updateMany
   */
  export type FranchiseBrandsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FranchiseBrands.
     */
    data: XOR<FranchiseBrandsUpdateManyMutationInput, FranchiseBrandsUncheckedUpdateManyInput>
    /**
     * Filter which FranchiseBrands to update
     */
    where?: FranchiseBrandsWhereInput
    /**
     * Limit how many FranchiseBrands to update.
     */
    limit?: number
  }

  /**
   * FranchiseBrands updateManyAndReturn
   */
  export type FranchiseBrandsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * The data used to update FranchiseBrands.
     */
    data: XOR<FranchiseBrandsUpdateManyMutationInput, FranchiseBrandsUncheckedUpdateManyInput>
    /**
     * Filter which FranchiseBrands to update
     */
    where?: FranchiseBrandsWhereInput
    /**
     * Limit how many FranchiseBrands to update.
     */
    limit?: number
  }

  /**
   * FranchiseBrands upsert
   */
  export type FranchiseBrandsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * The filter to search for the FranchiseBrands to update in case it exists.
     */
    where: FranchiseBrandsWhereUniqueInput
    /**
     * In case the FranchiseBrands found by the `where` argument doesn't exist, create a new FranchiseBrands with this data.
     */
    create: XOR<FranchiseBrandsCreateInput, FranchiseBrandsUncheckedCreateInput>
    /**
     * In case the FranchiseBrands was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FranchiseBrandsUpdateInput, FranchiseBrandsUncheckedUpdateInput>
  }

  /**
   * FranchiseBrands delete
   */
  export type FranchiseBrandsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
    /**
     * Filter which FranchiseBrands to delete.
     */
    where: FranchiseBrandsWhereUniqueInput
  }

  /**
   * FranchiseBrands deleteMany
   */
  export type FranchiseBrandsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FranchiseBrands to delete
     */
    where?: FranchiseBrandsWhereInput
    /**
     * Limit how many FranchiseBrands to delete.
     */
    limit?: number
  }

  /**
   * FranchiseBrands without action
   */
  export type FranchiseBrandsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FranchiseBrands
     */
    select?: FranchiseBrandsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FranchiseBrands
     */
    omit?: FranchiseBrandsOmit<ExtArgs> | null
  }


  /**
   * Model NationalPensionWorkplaces
   */

  export type AggregateNationalPensionWorkplaces = {
    _count: NationalPensionWorkplacesCountAggregateOutputType | null
    _avg: NationalPensionWorkplacesAvgAggregateOutputType | null
    _sum: NationalPensionWorkplacesSumAggregateOutputType | null
    _min: NationalPensionWorkplacesMinAggregateOutputType | null
    _max: NationalPensionWorkplacesMaxAggregateOutputType | null
  }

  export type NationalPensionWorkplacesAvgAggregateOutputType = {
    id: number | null
    workplaceStatusCode: number | null
    workplaceTypeCode: number | null
    memberCount: number | null
    monthlyNoticeAmount: number | null
    newAcquisitionCount: number | null
    lossCount: number | null
  }

  export type NationalPensionWorkplacesSumAggregateOutputType = {
    id: number | null
    workplaceStatusCode: number | null
    workplaceTypeCode: number | null
    memberCount: number | null
    monthlyNoticeAmount: bigint | null
    newAcquisitionCount: number | null
    lossCount: number | null
  }

  export type NationalPensionWorkplacesMinAggregateOutputType = {
    id: number | null
    dataYearMonth: string | null
    workplaceName: string | null
    businessRegistrationNumber: string | null
    workplaceStatusCode: number | null
    postalCode: string | null
    addressJibun: string | null
    addressRoad: string | null
    legalDongCode: string | null
    adminDongCode: string | null
    sidoCode: string | null
    sigunguCode: string | null
    eubmyeondongCode: string | null
    workplaceTypeCode: number | null
    industryCode: string | null
    industryName: string | null
    applicationDate: string | null
    reRegistrationDate: string | null
    withdrawalDate: string | null
    memberCount: number | null
    monthlyNoticeAmount: bigint | null
    newAcquisitionCount: number | null
    lossCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NationalPensionWorkplacesMaxAggregateOutputType = {
    id: number | null
    dataYearMonth: string | null
    workplaceName: string | null
    businessRegistrationNumber: string | null
    workplaceStatusCode: number | null
    postalCode: string | null
    addressJibun: string | null
    addressRoad: string | null
    legalDongCode: string | null
    adminDongCode: string | null
    sidoCode: string | null
    sigunguCode: string | null
    eubmyeondongCode: string | null
    workplaceTypeCode: number | null
    industryCode: string | null
    industryName: string | null
    applicationDate: string | null
    reRegistrationDate: string | null
    withdrawalDate: string | null
    memberCount: number | null
    monthlyNoticeAmount: bigint | null
    newAcquisitionCount: number | null
    lossCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NationalPensionWorkplacesCountAggregateOutputType = {
    id: number
    dataYearMonth: number
    workplaceName: number
    businessRegistrationNumber: number
    workplaceStatusCode: number
    postalCode: number
    addressJibun: number
    addressRoad: number
    legalDongCode: number
    adminDongCode: number
    sidoCode: number
    sigunguCode: number
    eubmyeondongCode: number
    workplaceTypeCode: number
    industryCode: number
    industryName: number
    applicationDate: number
    reRegistrationDate: number
    withdrawalDate: number
    memberCount: number
    monthlyNoticeAmount: number
    newAcquisitionCount: number
    lossCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NationalPensionWorkplacesAvgAggregateInputType = {
    id?: true
    workplaceStatusCode?: true
    workplaceTypeCode?: true
    memberCount?: true
    monthlyNoticeAmount?: true
    newAcquisitionCount?: true
    lossCount?: true
  }

  export type NationalPensionWorkplacesSumAggregateInputType = {
    id?: true
    workplaceStatusCode?: true
    workplaceTypeCode?: true
    memberCount?: true
    monthlyNoticeAmount?: true
    newAcquisitionCount?: true
    lossCount?: true
  }

  export type NationalPensionWorkplacesMinAggregateInputType = {
    id?: true
    dataYearMonth?: true
    workplaceName?: true
    businessRegistrationNumber?: true
    workplaceStatusCode?: true
    postalCode?: true
    addressJibun?: true
    addressRoad?: true
    legalDongCode?: true
    adminDongCode?: true
    sidoCode?: true
    sigunguCode?: true
    eubmyeondongCode?: true
    workplaceTypeCode?: true
    industryCode?: true
    industryName?: true
    applicationDate?: true
    reRegistrationDate?: true
    withdrawalDate?: true
    memberCount?: true
    monthlyNoticeAmount?: true
    newAcquisitionCount?: true
    lossCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NationalPensionWorkplacesMaxAggregateInputType = {
    id?: true
    dataYearMonth?: true
    workplaceName?: true
    businessRegistrationNumber?: true
    workplaceStatusCode?: true
    postalCode?: true
    addressJibun?: true
    addressRoad?: true
    legalDongCode?: true
    adminDongCode?: true
    sidoCode?: true
    sigunguCode?: true
    eubmyeondongCode?: true
    workplaceTypeCode?: true
    industryCode?: true
    industryName?: true
    applicationDate?: true
    reRegistrationDate?: true
    withdrawalDate?: true
    memberCount?: true
    monthlyNoticeAmount?: true
    newAcquisitionCount?: true
    lossCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NationalPensionWorkplacesCountAggregateInputType = {
    id?: true
    dataYearMonth?: true
    workplaceName?: true
    businessRegistrationNumber?: true
    workplaceStatusCode?: true
    postalCode?: true
    addressJibun?: true
    addressRoad?: true
    legalDongCode?: true
    adminDongCode?: true
    sidoCode?: true
    sigunguCode?: true
    eubmyeondongCode?: true
    workplaceTypeCode?: true
    industryCode?: true
    industryName?: true
    applicationDate?: true
    reRegistrationDate?: true
    withdrawalDate?: true
    memberCount?: true
    monthlyNoticeAmount?: true
    newAcquisitionCount?: true
    lossCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NationalPensionWorkplacesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NationalPensionWorkplaces to aggregate.
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NationalPensionWorkplaces to fetch.
     */
    orderBy?: NationalPensionWorkplacesOrderByWithRelationInput | NationalPensionWorkplacesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NationalPensionWorkplacesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NationalPensionWorkplaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NationalPensionWorkplaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NationalPensionWorkplaces
    **/
    _count?: true | NationalPensionWorkplacesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NationalPensionWorkplacesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NationalPensionWorkplacesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NationalPensionWorkplacesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NationalPensionWorkplacesMaxAggregateInputType
  }

  export type GetNationalPensionWorkplacesAggregateType<T extends NationalPensionWorkplacesAggregateArgs> = {
        [P in keyof T & keyof AggregateNationalPensionWorkplaces]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNationalPensionWorkplaces[P]>
      : GetScalarType<T[P], AggregateNationalPensionWorkplaces[P]>
  }




  export type NationalPensionWorkplacesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NationalPensionWorkplacesWhereInput
    orderBy?: NationalPensionWorkplacesOrderByWithAggregationInput | NationalPensionWorkplacesOrderByWithAggregationInput[]
    by: NationalPensionWorkplacesScalarFieldEnum[] | NationalPensionWorkplacesScalarFieldEnum
    having?: NationalPensionWorkplacesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NationalPensionWorkplacesCountAggregateInputType | true
    _avg?: NationalPensionWorkplacesAvgAggregateInputType
    _sum?: NationalPensionWorkplacesSumAggregateInputType
    _min?: NationalPensionWorkplacesMinAggregateInputType
    _max?: NationalPensionWorkplacesMaxAggregateInputType
  }

  export type NationalPensionWorkplacesGroupByOutputType = {
    id: number
    dataYearMonth: string
    workplaceName: string
    businessRegistrationNumber: string
    workplaceStatusCode: number
    postalCode: string | null
    addressJibun: string | null
    addressRoad: string | null
    legalDongCode: string | null
    adminDongCode: string | null
    sidoCode: string | null
    sigunguCode: string | null
    eubmyeondongCode: string | null
    workplaceTypeCode: number | null
    industryCode: string | null
    industryName: string | null
    applicationDate: string | null
    reRegistrationDate: string | null
    withdrawalDate: string | null
    memberCount: number | null
    monthlyNoticeAmount: bigint | null
    newAcquisitionCount: number | null
    lossCount: number | null
    createdAt: Date
    updatedAt: Date
    _count: NationalPensionWorkplacesCountAggregateOutputType | null
    _avg: NationalPensionWorkplacesAvgAggregateOutputType | null
    _sum: NationalPensionWorkplacesSumAggregateOutputType | null
    _min: NationalPensionWorkplacesMinAggregateOutputType | null
    _max: NationalPensionWorkplacesMaxAggregateOutputType | null
  }

  type GetNationalPensionWorkplacesGroupByPayload<T extends NationalPensionWorkplacesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NationalPensionWorkplacesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NationalPensionWorkplacesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NationalPensionWorkplacesGroupByOutputType[P]>
            : GetScalarType<T[P], NationalPensionWorkplacesGroupByOutputType[P]>
        }
      >
    >


  export type NationalPensionWorkplacesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataYearMonth?: boolean
    workplaceName?: boolean
    businessRegistrationNumber?: boolean
    workplaceStatusCode?: boolean
    postalCode?: boolean
    addressJibun?: boolean
    addressRoad?: boolean
    legalDongCode?: boolean
    adminDongCode?: boolean
    sidoCode?: boolean
    sigunguCode?: boolean
    eubmyeondongCode?: boolean
    workplaceTypeCode?: boolean
    industryCode?: boolean
    industryName?: boolean
    applicationDate?: boolean
    reRegistrationDate?: boolean
    withdrawalDate?: boolean
    memberCount?: boolean
    monthlyNoticeAmount?: boolean
    newAcquisitionCount?: boolean
    lossCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["nationalPensionWorkplaces"]>

  export type NationalPensionWorkplacesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataYearMonth?: boolean
    workplaceName?: boolean
    businessRegistrationNumber?: boolean
    workplaceStatusCode?: boolean
    postalCode?: boolean
    addressJibun?: boolean
    addressRoad?: boolean
    legalDongCode?: boolean
    adminDongCode?: boolean
    sidoCode?: boolean
    sigunguCode?: boolean
    eubmyeondongCode?: boolean
    workplaceTypeCode?: boolean
    industryCode?: boolean
    industryName?: boolean
    applicationDate?: boolean
    reRegistrationDate?: boolean
    withdrawalDate?: boolean
    memberCount?: boolean
    monthlyNoticeAmount?: boolean
    newAcquisitionCount?: boolean
    lossCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["nationalPensionWorkplaces"]>

  export type NationalPensionWorkplacesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataYearMonth?: boolean
    workplaceName?: boolean
    businessRegistrationNumber?: boolean
    workplaceStatusCode?: boolean
    postalCode?: boolean
    addressJibun?: boolean
    addressRoad?: boolean
    legalDongCode?: boolean
    adminDongCode?: boolean
    sidoCode?: boolean
    sigunguCode?: boolean
    eubmyeondongCode?: boolean
    workplaceTypeCode?: boolean
    industryCode?: boolean
    industryName?: boolean
    applicationDate?: boolean
    reRegistrationDate?: boolean
    withdrawalDate?: boolean
    memberCount?: boolean
    monthlyNoticeAmount?: boolean
    newAcquisitionCount?: boolean
    lossCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["nationalPensionWorkplaces"]>

  export type NationalPensionWorkplacesSelectScalar = {
    id?: boolean
    dataYearMonth?: boolean
    workplaceName?: boolean
    businessRegistrationNumber?: boolean
    workplaceStatusCode?: boolean
    postalCode?: boolean
    addressJibun?: boolean
    addressRoad?: boolean
    legalDongCode?: boolean
    adminDongCode?: boolean
    sidoCode?: boolean
    sigunguCode?: boolean
    eubmyeondongCode?: boolean
    workplaceTypeCode?: boolean
    industryCode?: boolean
    industryName?: boolean
    applicationDate?: boolean
    reRegistrationDate?: boolean
    withdrawalDate?: boolean
    memberCount?: boolean
    monthlyNoticeAmount?: boolean
    newAcquisitionCount?: boolean
    lossCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type NationalPensionWorkplacesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dataYearMonth" | "workplaceName" | "businessRegistrationNumber" | "workplaceStatusCode" | "postalCode" | "addressJibun" | "addressRoad" | "legalDongCode" | "adminDongCode" | "sidoCode" | "sigunguCode" | "eubmyeondongCode" | "workplaceTypeCode" | "industryCode" | "industryName" | "applicationDate" | "reRegistrationDate" | "withdrawalDate" | "memberCount" | "monthlyNoticeAmount" | "newAcquisitionCount" | "lossCount" | "createdAt" | "updatedAt", ExtArgs["result"]["nationalPensionWorkplaces"]>

  export type $NationalPensionWorkplacesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NationalPensionWorkplaces"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      dataYearMonth: string
      workplaceName: string
      businessRegistrationNumber: string
      workplaceStatusCode: number
      postalCode: string | null
      addressJibun: string | null
      addressRoad: string | null
      legalDongCode: string | null
      adminDongCode: string | null
      sidoCode: string | null
      sigunguCode: string | null
      eubmyeondongCode: string | null
      workplaceTypeCode: number | null
      industryCode: string | null
      industryName: string | null
      applicationDate: string | null
      reRegistrationDate: string | null
      withdrawalDate: string | null
      memberCount: number | null
      monthlyNoticeAmount: bigint | null
      newAcquisitionCount: number | null
      lossCount: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["nationalPensionWorkplaces"]>
    composites: {}
  }

  type NationalPensionWorkplacesGetPayload<S extends boolean | null | undefined | NationalPensionWorkplacesDefaultArgs> = $Result.GetResult<Prisma.$NationalPensionWorkplacesPayload, S>

  type NationalPensionWorkplacesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NationalPensionWorkplacesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NationalPensionWorkplacesCountAggregateInputType | true
    }

  export interface NationalPensionWorkplacesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NationalPensionWorkplaces'], meta: { name: 'NationalPensionWorkplaces' } }
    /**
     * Find zero or one NationalPensionWorkplaces that matches the filter.
     * @param {NationalPensionWorkplacesFindUniqueArgs} args - Arguments to find a NationalPensionWorkplaces
     * @example
     * // Get one NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NationalPensionWorkplacesFindUniqueArgs>(args: SelectSubset<T, NationalPensionWorkplacesFindUniqueArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NationalPensionWorkplaces that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NationalPensionWorkplacesFindUniqueOrThrowArgs} args - Arguments to find a NationalPensionWorkplaces
     * @example
     * // Get one NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NationalPensionWorkplacesFindUniqueOrThrowArgs>(args: SelectSubset<T, NationalPensionWorkplacesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NationalPensionWorkplaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesFindFirstArgs} args - Arguments to find a NationalPensionWorkplaces
     * @example
     * // Get one NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NationalPensionWorkplacesFindFirstArgs>(args?: SelectSubset<T, NationalPensionWorkplacesFindFirstArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NationalPensionWorkplaces that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesFindFirstOrThrowArgs} args - Arguments to find a NationalPensionWorkplaces
     * @example
     * // Get one NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NationalPensionWorkplacesFindFirstOrThrowArgs>(args?: SelectSubset<T, NationalPensionWorkplacesFindFirstOrThrowArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NationalPensionWorkplaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findMany()
     * 
     * // Get first 10 NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nationalPensionWorkplacesWithIdOnly = await prisma.nationalPensionWorkplaces.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NationalPensionWorkplacesFindManyArgs>(args?: SelectSubset<T, NationalPensionWorkplacesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesCreateArgs} args - Arguments to create a NationalPensionWorkplaces.
     * @example
     * // Create one NationalPensionWorkplaces
     * const NationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.create({
     *   data: {
     *     // ... data to create a NationalPensionWorkplaces
     *   }
     * })
     * 
     */
    create<T extends NationalPensionWorkplacesCreateArgs>(args: SelectSubset<T, NationalPensionWorkplacesCreateArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesCreateManyArgs} args - Arguments to create many NationalPensionWorkplaces.
     * @example
     * // Create many NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NationalPensionWorkplacesCreateManyArgs>(args?: SelectSubset<T, NationalPensionWorkplacesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NationalPensionWorkplaces and returns the data saved in the database.
     * @param {NationalPensionWorkplacesCreateManyAndReturnArgs} args - Arguments to create many NationalPensionWorkplaces.
     * @example
     * // Create many NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NationalPensionWorkplaces and only return the `id`
     * const nationalPensionWorkplacesWithIdOnly = await prisma.nationalPensionWorkplaces.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NationalPensionWorkplacesCreateManyAndReturnArgs>(args?: SelectSubset<T, NationalPensionWorkplacesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesDeleteArgs} args - Arguments to delete one NationalPensionWorkplaces.
     * @example
     * // Delete one NationalPensionWorkplaces
     * const NationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.delete({
     *   where: {
     *     // ... filter to delete one NationalPensionWorkplaces
     *   }
     * })
     * 
     */
    delete<T extends NationalPensionWorkplacesDeleteArgs>(args: SelectSubset<T, NationalPensionWorkplacesDeleteArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesUpdateArgs} args - Arguments to update one NationalPensionWorkplaces.
     * @example
     * // Update one NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NationalPensionWorkplacesUpdateArgs>(args: SelectSubset<T, NationalPensionWorkplacesUpdateArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesDeleteManyArgs} args - Arguments to filter NationalPensionWorkplaces to delete.
     * @example
     * // Delete a few NationalPensionWorkplaces
     * const { count } = await prisma.nationalPensionWorkplaces.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NationalPensionWorkplacesDeleteManyArgs>(args?: SelectSubset<T, NationalPensionWorkplacesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NationalPensionWorkplaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NationalPensionWorkplacesUpdateManyArgs>(args: SelectSubset<T, NationalPensionWorkplacesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NationalPensionWorkplaces and returns the data updated in the database.
     * @param {NationalPensionWorkplacesUpdateManyAndReturnArgs} args - Arguments to update many NationalPensionWorkplaces.
     * @example
     * // Update many NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NationalPensionWorkplaces and only return the `id`
     * const nationalPensionWorkplacesWithIdOnly = await prisma.nationalPensionWorkplaces.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NationalPensionWorkplacesUpdateManyAndReturnArgs>(args: SelectSubset<T, NationalPensionWorkplacesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NationalPensionWorkplaces.
     * @param {NationalPensionWorkplacesUpsertArgs} args - Arguments to update or create a NationalPensionWorkplaces.
     * @example
     * // Update or create a NationalPensionWorkplaces
     * const nationalPensionWorkplaces = await prisma.nationalPensionWorkplaces.upsert({
     *   create: {
     *     // ... data to create a NationalPensionWorkplaces
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NationalPensionWorkplaces we want to update
     *   }
     * })
     */
    upsert<T extends NationalPensionWorkplacesUpsertArgs>(args: SelectSubset<T, NationalPensionWorkplacesUpsertArgs<ExtArgs>>): Prisma__NationalPensionWorkplacesClient<$Result.GetResult<Prisma.$NationalPensionWorkplacesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NationalPensionWorkplaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesCountArgs} args - Arguments to filter NationalPensionWorkplaces to count.
     * @example
     * // Count the number of NationalPensionWorkplaces
     * const count = await prisma.nationalPensionWorkplaces.count({
     *   where: {
     *     // ... the filter for the NationalPensionWorkplaces we want to count
     *   }
     * })
    **/
    count<T extends NationalPensionWorkplacesCountArgs>(
      args?: Subset<T, NationalPensionWorkplacesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NationalPensionWorkplacesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NationalPensionWorkplaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NationalPensionWorkplacesAggregateArgs>(args: Subset<T, NationalPensionWorkplacesAggregateArgs>): Prisma.PrismaPromise<GetNationalPensionWorkplacesAggregateType<T>>

    /**
     * Group by NationalPensionWorkplaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NationalPensionWorkplacesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NationalPensionWorkplacesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NationalPensionWorkplacesGroupByArgs['orderBy'] }
        : { orderBy?: NationalPensionWorkplacesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NationalPensionWorkplacesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNationalPensionWorkplacesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NationalPensionWorkplaces model
   */
  readonly fields: NationalPensionWorkplacesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NationalPensionWorkplaces.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NationalPensionWorkplacesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NationalPensionWorkplaces model
   */
  interface NationalPensionWorkplacesFieldRefs {
    readonly id: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly dataYearMonth: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly workplaceName: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly businessRegistrationNumber: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly workplaceStatusCode: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly postalCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly addressJibun: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly addressRoad: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly legalDongCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly adminDongCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly sidoCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly sigunguCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly eubmyeondongCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly workplaceTypeCode: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly industryCode: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly industryName: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly applicationDate: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly reRegistrationDate: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly withdrawalDate: FieldRef<"NationalPensionWorkplaces", 'String'>
    readonly memberCount: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly monthlyNoticeAmount: FieldRef<"NationalPensionWorkplaces", 'BigInt'>
    readonly newAcquisitionCount: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly lossCount: FieldRef<"NationalPensionWorkplaces", 'Int'>
    readonly createdAt: FieldRef<"NationalPensionWorkplaces", 'DateTime'>
    readonly updatedAt: FieldRef<"NationalPensionWorkplaces", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NationalPensionWorkplaces findUnique
   */
  export type NationalPensionWorkplacesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter, which NationalPensionWorkplaces to fetch.
     */
    where: NationalPensionWorkplacesWhereUniqueInput
  }

  /**
   * NationalPensionWorkplaces findUniqueOrThrow
   */
  export type NationalPensionWorkplacesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter, which NationalPensionWorkplaces to fetch.
     */
    where: NationalPensionWorkplacesWhereUniqueInput
  }

  /**
   * NationalPensionWorkplaces findFirst
   */
  export type NationalPensionWorkplacesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter, which NationalPensionWorkplaces to fetch.
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NationalPensionWorkplaces to fetch.
     */
    orderBy?: NationalPensionWorkplacesOrderByWithRelationInput | NationalPensionWorkplacesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NationalPensionWorkplaces.
     */
    cursor?: NationalPensionWorkplacesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NationalPensionWorkplaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NationalPensionWorkplaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NationalPensionWorkplaces.
     */
    distinct?: NationalPensionWorkplacesScalarFieldEnum | NationalPensionWorkplacesScalarFieldEnum[]
  }

  /**
   * NationalPensionWorkplaces findFirstOrThrow
   */
  export type NationalPensionWorkplacesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter, which NationalPensionWorkplaces to fetch.
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NationalPensionWorkplaces to fetch.
     */
    orderBy?: NationalPensionWorkplacesOrderByWithRelationInput | NationalPensionWorkplacesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NationalPensionWorkplaces.
     */
    cursor?: NationalPensionWorkplacesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NationalPensionWorkplaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NationalPensionWorkplaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NationalPensionWorkplaces.
     */
    distinct?: NationalPensionWorkplacesScalarFieldEnum | NationalPensionWorkplacesScalarFieldEnum[]
  }

  /**
   * NationalPensionWorkplaces findMany
   */
  export type NationalPensionWorkplacesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter, which NationalPensionWorkplaces to fetch.
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NationalPensionWorkplaces to fetch.
     */
    orderBy?: NationalPensionWorkplacesOrderByWithRelationInput | NationalPensionWorkplacesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NationalPensionWorkplaces.
     */
    cursor?: NationalPensionWorkplacesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NationalPensionWorkplaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NationalPensionWorkplaces.
     */
    skip?: number
    distinct?: NationalPensionWorkplacesScalarFieldEnum | NationalPensionWorkplacesScalarFieldEnum[]
  }

  /**
   * NationalPensionWorkplaces create
   */
  export type NationalPensionWorkplacesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * The data needed to create a NationalPensionWorkplaces.
     */
    data: XOR<NationalPensionWorkplacesCreateInput, NationalPensionWorkplacesUncheckedCreateInput>
  }

  /**
   * NationalPensionWorkplaces createMany
   */
  export type NationalPensionWorkplacesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NationalPensionWorkplaces.
     */
    data: NationalPensionWorkplacesCreateManyInput | NationalPensionWorkplacesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NationalPensionWorkplaces createManyAndReturn
   */
  export type NationalPensionWorkplacesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * The data used to create many NationalPensionWorkplaces.
     */
    data: NationalPensionWorkplacesCreateManyInput | NationalPensionWorkplacesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NationalPensionWorkplaces update
   */
  export type NationalPensionWorkplacesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * The data needed to update a NationalPensionWorkplaces.
     */
    data: XOR<NationalPensionWorkplacesUpdateInput, NationalPensionWorkplacesUncheckedUpdateInput>
    /**
     * Choose, which NationalPensionWorkplaces to update.
     */
    where: NationalPensionWorkplacesWhereUniqueInput
  }

  /**
   * NationalPensionWorkplaces updateMany
   */
  export type NationalPensionWorkplacesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NationalPensionWorkplaces.
     */
    data: XOR<NationalPensionWorkplacesUpdateManyMutationInput, NationalPensionWorkplacesUncheckedUpdateManyInput>
    /**
     * Filter which NationalPensionWorkplaces to update
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * Limit how many NationalPensionWorkplaces to update.
     */
    limit?: number
  }

  /**
   * NationalPensionWorkplaces updateManyAndReturn
   */
  export type NationalPensionWorkplacesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * The data used to update NationalPensionWorkplaces.
     */
    data: XOR<NationalPensionWorkplacesUpdateManyMutationInput, NationalPensionWorkplacesUncheckedUpdateManyInput>
    /**
     * Filter which NationalPensionWorkplaces to update
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * Limit how many NationalPensionWorkplaces to update.
     */
    limit?: number
  }

  /**
   * NationalPensionWorkplaces upsert
   */
  export type NationalPensionWorkplacesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * The filter to search for the NationalPensionWorkplaces to update in case it exists.
     */
    where: NationalPensionWorkplacesWhereUniqueInput
    /**
     * In case the NationalPensionWorkplaces found by the `where` argument doesn't exist, create a new NationalPensionWorkplaces with this data.
     */
    create: XOR<NationalPensionWorkplacesCreateInput, NationalPensionWorkplacesUncheckedCreateInput>
    /**
     * In case the NationalPensionWorkplaces was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NationalPensionWorkplacesUpdateInput, NationalPensionWorkplacesUncheckedUpdateInput>
  }

  /**
   * NationalPensionWorkplaces delete
   */
  export type NationalPensionWorkplacesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
    /**
     * Filter which NationalPensionWorkplaces to delete.
     */
    where: NationalPensionWorkplacesWhereUniqueInput
  }

  /**
   * NationalPensionWorkplaces deleteMany
   */
  export type NationalPensionWorkplacesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NationalPensionWorkplaces to delete
     */
    where?: NationalPensionWorkplacesWhereInput
    /**
     * Limit how many NationalPensionWorkplaces to delete.
     */
    limit?: number
  }

  /**
   * NationalPensionWorkplaces without action
   */
  export type NationalPensionWorkplacesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NationalPensionWorkplaces
     */
    select?: NationalPensionWorkplacesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NationalPensionWorkplaces
     */
    omit?: NationalPensionWorkplacesOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CompanyScalarFieldEnum: {
    id: 'id',
    companyName: 'companyName',
    businessRegistrationNumber: 'businessRegistrationNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    taxpayerType: 'taxpayerType'
  };

  export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum]


  export const TransactionCacheScalarFieldEnum: {
    rawTextHash: 'rawTextHash',
    rawText: 'rawText',
    uniqueKey: 'uniqueKey',
    createdAt: 'createdAt'
  };

  export type TransactionCacheScalarFieldEnum = (typeof TransactionCacheScalarFieldEnum)[keyof typeof TransactionCacheScalarFieldEnum]


  export const RuleScalarFieldEnum: {
    id: 'id',
    companyId: 'companyId',
    uniqueKey: 'uniqueKey',
    targetDebitAccount: 'targetDebitAccount',
    targetCreditAccount: 'targetCreditAccount',
    targetSuggestedTag: 'targetSuggestedTag',
    vatApplicable: 'vatApplicable',
    priority: 'priority',
    isActive: 'isActive',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
  };

  export type RuleScalarFieldEnum = (typeof RuleScalarFieldEnum)[keyof typeof RuleScalarFieldEnum]


  export const RuleCandidateScalarFieldEnum: {
    id: 'id',
    companyId: 'companyId',
    uniqueKey: 'uniqueKey',
    targetDebitAccount: 'targetDebitAccount',
    targetSuggestedTag: 'targetSuggestedTag',
    vatApplicable: 'vatApplicable',
    suggestionCount: 'suggestionCount',
    lastSuggestedAt: 'lastSuggestedAt'
  };

  export type RuleCandidateScalarFieldEnum = (typeof RuleCandidateScalarFieldEnum)[keyof typeof RuleCandidateScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    companyId: 'companyId',
    rawText: 'rawText',
    transactionDate: 'transactionDate',
    amount: 'amount',
    normalizedUniqueKey: 'normalizedUniqueKey',
    isAnomaly: 'isAnomaly',
    anomalyScore: 'anomalyScore',
    llmResponse: 'llmResponse',
    userClarification: 'userClarification',
    finalDebitAccount: 'finalDebitAccount',
    finalCreditAccount: 'finalCreditAccount',
    finalSuggestedTag: 'finalSuggestedTag',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    transactionType: 'transactionType',
    status: 'status',
    processedBy: 'processedBy'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const DatacollectionGyeonggiDeliveryScalarFieldEnum: {
    id: 'id',
    listTotalCount: 'listTotalCount',
    responseCode: 'responseCode',
    responseMessage: 'responseMessage',
    apiVersion: 'apiVersion',
    businessRegNo: 'businessRegNo',
    sigunName: 'sigunName',
    storeName: 'storeName',
    industryType: 'industryType',
    refinedRoadAddress: 'refinedRoadAddress',
    refinedLotAddress: 'refinedLotAddress',
    refinedZipcode: 'refinedZipcode',
    refinedLatitude: 'refinedLatitude',
    refinedLongitude: 'refinedLongitude',
    dataSource: 'dataSource',
    collectionBatchId: 'collectionBatchId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DatacollectionGyeonggiDeliveryScalarFieldEnum = (typeof DatacollectionGyeonggiDeliveryScalarFieldEnum)[keyof typeof DatacollectionGyeonggiDeliveryScalarFieldEnum]


  export const DatacollectionSeoulRestaurantsScalarFieldEnum: {
    id: 'id',
    licenseDate: 'licenseDate',
    businessStatusCode: 'businessStatusCode',
    businessStatusName: 'businessStatusName',
    businessName: 'businessName',
    businessType: 'businessType',
    dataSource: 'dataSource',
    collectionBatchId: 'collectionBatchId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    apiVersion: 'apiVersion',
    businessRegistrationNumber: 'businessRegistrationNumber',
    licenseExpiryDate: 'licenseExpiryDate',
    listTotalCount: 'listTotalCount',
    lotNumberAddress: 'lotNumberAddress',
    refinedLatitude: 'refinedLatitude',
    refinedLongitude: 'refinedLongitude',
    responseCode: 'responseCode',
    responseMessage: 'responseMessage',
    roadNameAddress: 'roadNameAddress',
    zipCode: 'zipCode'
  };

  export type DatacollectionSeoulRestaurantsScalarFieldEnum = (typeof DatacollectionSeoulRestaurantsScalarFieldEnum)[keyof typeof DatacollectionSeoulRestaurantsScalarFieldEnum]


  export const RuleEngineScalarFieldEnum: {
    id: 'id',
    keyword: 'keyword',
    confidence: 'confidence',
    question: 'question',
    primaryTag: 'primaryTag',
    primaryAccount: 'primaryAccount',
    secondaryTag: 'secondaryTag',
    secondaryAccount: 'secondaryAccount',
    usageCount: 'usageCount',
    positiveCount: 'positiveCount',
    negativeCount: 'negativeCount',
    lastUsed: 'lastUsed',
    isActive: 'isActive',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RuleEngineScalarFieldEnum = (typeof RuleEngineScalarFieldEnum)[keyof typeof RuleEngineScalarFieldEnum]


  export const RuleEngineCandidateScalarFieldEnum: {
    id: 'id',
    keyword: 'keyword',
    tag: 'tag',
    account: 'account',
    suggestionCount: 'suggestionCount',
    approvalThreshold: 'approvalThreshold',
    firstSuggested: 'firstSuggested',
    lastSuggested: 'lastSuggested',
    isApproved: 'isApproved',
    approvedAt: 'approvedAt',
    approvedBy: 'approvedBy'
  };

  export type RuleEngineCandidateScalarFieldEnum = (typeof RuleEngineCandidateScalarFieldEnum)[keyof typeof RuleEngineCandidateScalarFieldEnum]


  export const RuleEngineFeedbackScalarFieldEnum: {
    id: 'id',
    ruleId: 'ruleId',
    transactionText: 'transactionText',
    normalizedText: 'normalizedText',
    selectedOption: 'selectedOption',
    selectedTag: 'selectedTag',
    selectedAccount: 'selectedAccount',
    feedbackType: 'feedbackType',
    createdAt: 'createdAt'
  };

  export type RuleEngineFeedbackScalarFieldEnum = (typeof RuleEngineFeedbackScalarFieldEnum)[keyof typeof RuleEngineFeedbackScalarFieldEnum]


  export const FranchiseBrandsScalarFieldEnum: {
    id: 'id',
    businessYear: 'businessYear',
    brandId: 'brandId',
    headquartersId: 'headquartersId',
    businessRegistrationNumber: 'businessRegistrationNumber',
    corporateRegistrationNumber: 'corporateRegistrationNumber',
    representativeName: 'representativeName',
    brandName: 'brandName',
    industryLargeCategory: 'industryLargeCategory',
    industryMediumCategory: 'industryMediumCategory',
    mainProduct: 'mainProduct',
    businessStartDate: 'businessStartDate',
    companyName: 'companyName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FranchiseBrandsScalarFieldEnum = (typeof FranchiseBrandsScalarFieldEnum)[keyof typeof FranchiseBrandsScalarFieldEnum]


  export const NationalPensionWorkplacesScalarFieldEnum: {
    id: 'id',
    dataYearMonth: 'dataYearMonth',
    workplaceName: 'workplaceName',
    businessRegistrationNumber: 'businessRegistrationNumber',
    workplaceStatusCode: 'workplaceStatusCode',
    postalCode: 'postalCode',
    addressJibun: 'addressJibun',
    addressRoad: 'addressRoad',
    legalDongCode: 'legalDongCode',
    adminDongCode: 'adminDongCode',
    sidoCode: 'sidoCode',
    sigunguCode: 'sigunguCode',
    eubmyeondongCode: 'eubmyeondongCode',
    workplaceTypeCode: 'workplaceTypeCode',
    industryCode: 'industryCode',
    industryName: 'industryName',
    applicationDate: 'applicationDate',
    reRegistrationDate: 'reRegistrationDate',
    withdrawalDate: 'withdrawalDate',
    memberCount: 'memberCount',
    monthlyNoticeAmount: 'monthlyNoticeAmount',
    newAcquisitionCount: 'newAcquisitionCount',
    lossCount: 'lossCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NationalPensionWorkplacesScalarFieldEnum = (typeof NationalPensionWorkplacesScalarFieldEnum)[keyof typeof NationalPensionWorkplacesScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'TaxpayerType'
   */
  export type EnumTaxpayerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaxpayerType'>
    


  /**
   * Reference to a field of type 'TaxpayerType[]'
   */
  export type ListEnumTaxpayerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaxpayerType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'RuleCreator'
   */
  export type EnumRuleCreatorFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RuleCreator'>
    


  /**
   * Reference to a field of type 'RuleCreator[]'
   */
  export type ListEnumRuleCreatorFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RuleCreator[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'TransactionIOType'
   */
  export type EnumTransactionIOTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionIOType'>
    


  /**
   * Reference to a field of type 'TransactionIOType[]'
   */
  export type ListEnumTransactionIOTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionIOType[]'>
    


  /**
   * Reference to a field of type 'TransactionStatus'
   */
  export type EnumTransactionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionStatus'>
    


  /**
   * Reference to a field of type 'TransactionStatus[]'
   */
  export type ListEnumTransactionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionStatus[]'>
    


  /**
   * Reference to a field of type 'ProcessorType'
   */
  export type EnumProcessorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessorType'>
    


  /**
   * Reference to a field of type 'ProcessorType[]'
   */
  export type ListEnumProcessorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessorType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CompanyWhereInput = {
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    id?: UuidFilter<"Company"> | string
    companyName?: StringFilter<"Company"> | string
    businessRegistrationNumber?: StringNullableFilter<"Company"> | string | null
    createdAt?: DateTimeFilter<"Company"> | Date | string
    updatedAt?: DateTimeFilter<"Company"> | Date | string
    taxpayerType?: EnumTaxpayerTypeFilter<"Company"> | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateListRelationFilter
    rules?: RuleListRelationFilter
    transactions?: TransactionListRelationFilter
  }

  export type CompanyOrderByWithRelationInput = {
    id?: SortOrder
    companyName?: SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taxpayerType?: SortOrder
    ruleCandidates?: RuleCandidateOrderByRelationAggregateInput
    rules?: RuleOrderByRelationAggregateInput
    transactions?: TransactionOrderByRelationAggregateInput
  }

  export type CompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    businessRegistrationNumber?: string
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    companyName?: StringFilter<"Company"> | string
    createdAt?: DateTimeFilter<"Company"> | Date | string
    updatedAt?: DateTimeFilter<"Company"> | Date | string
    taxpayerType?: EnumTaxpayerTypeFilter<"Company"> | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateListRelationFilter
    rules?: RuleListRelationFilter
    transactions?: TransactionListRelationFilter
  }, "id" | "businessRegistrationNumber">

  export type CompanyOrderByWithAggregationInput = {
    id?: SortOrder
    companyName?: SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taxpayerType?: SortOrder
    _count?: CompanyCountOrderByAggregateInput
    _max?: CompanyMaxOrderByAggregateInput
    _min?: CompanyMinOrderByAggregateInput
  }

  export type CompanyScalarWhereWithAggregatesInput = {
    AND?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    OR?: CompanyScalarWhereWithAggregatesInput[]
    NOT?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Company"> | string
    companyName?: StringWithAggregatesFilter<"Company"> | string
    businessRegistrationNumber?: StringNullableWithAggregatesFilter<"Company"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Company"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Company"> | Date | string
    taxpayerType?: EnumTaxpayerTypeWithAggregatesFilter<"Company"> | $Enums.TaxpayerType
  }

  export type TransactionCacheWhereInput = {
    AND?: TransactionCacheWhereInput | TransactionCacheWhereInput[]
    OR?: TransactionCacheWhereInput[]
    NOT?: TransactionCacheWhereInput | TransactionCacheWhereInput[]
    rawTextHash?: StringFilter<"TransactionCache"> | string
    rawText?: StringFilter<"TransactionCache"> | string
    uniqueKey?: StringFilter<"TransactionCache"> | string
    createdAt?: DateTimeFilter<"TransactionCache"> | Date | string
  }

  export type TransactionCacheOrderByWithRelationInput = {
    rawTextHash?: SortOrder
    rawText?: SortOrder
    uniqueKey?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionCacheWhereUniqueInput = Prisma.AtLeast<{
    rawTextHash?: string
    AND?: TransactionCacheWhereInput | TransactionCacheWhereInput[]
    OR?: TransactionCacheWhereInput[]
    NOT?: TransactionCacheWhereInput | TransactionCacheWhereInput[]
    rawText?: StringFilter<"TransactionCache"> | string
    uniqueKey?: StringFilter<"TransactionCache"> | string
    createdAt?: DateTimeFilter<"TransactionCache"> | Date | string
  }, "rawTextHash">

  export type TransactionCacheOrderByWithAggregationInput = {
    rawTextHash?: SortOrder
    rawText?: SortOrder
    uniqueKey?: SortOrder
    createdAt?: SortOrder
    _count?: TransactionCacheCountOrderByAggregateInput
    _max?: TransactionCacheMaxOrderByAggregateInput
    _min?: TransactionCacheMinOrderByAggregateInput
  }

  export type TransactionCacheScalarWhereWithAggregatesInput = {
    AND?: TransactionCacheScalarWhereWithAggregatesInput | TransactionCacheScalarWhereWithAggregatesInput[]
    OR?: TransactionCacheScalarWhereWithAggregatesInput[]
    NOT?: TransactionCacheScalarWhereWithAggregatesInput | TransactionCacheScalarWhereWithAggregatesInput[]
    rawTextHash?: StringWithAggregatesFilter<"TransactionCache"> | string
    rawText?: StringWithAggregatesFilter<"TransactionCache"> | string
    uniqueKey?: StringWithAggregatesFilter<"TransactionCache"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TransactionCache"> | Date | string
  }

  export type RuleWhereInput = {
    AND?: RuleWhereInput | RuleWhereInput[]
    OR?: RuleWhereInput[]
    NOT?: RuleWhereInput | RuleWhereInput[]
    id?: IntFilter<"Rule"> | number
    companyId?: UuidFilter<"Rule"> | string
    uniqueKey?: StringFilter<"Rule"> | string
    targetDebitAccount?: StringFilter<"Rule"> | string
    targetCreditAccount?: StringFilter<"Rule"> | string
    targetSuggestedTag?: StringNullableFilter<"Rule"> | string | null
    vatApplicable?: BoolFilter<"Rule"> | boolean
    priority?: IntFilter<"Rule"> | number
    isActive?: BoolFilter<"Rule"> | boolean
    createdAt?: DateTimeFilter<"Rule"> | Date | string
    createdBy?: EnumRuleCreatorFilter<"Rule"> | $Enums.RuleCreator
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }

  export type RuleOrderByWithRelationInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetCreditAccount?: SortOrder
    targetSuggestedTag?: SortOrderInput | SortOrder
    vatApplicable?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    company?: CompanyOrderByWithRelationInput
  }

  export type RuleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    companyId_uniqueKey?: RuleCompanyIdUniqueKeyCompoundUniqueInput
    AND?: RuleWhereInput | RuleWhereInput[]
    OR?: RuleWhereInput[]
    NOT?: RuleWhereInput | RuleWhereInput[]
    companyId?: UuidFilter<"Rule"> | string
    uniqueKey?: StringFilter<"Rule"> | string
    targetDebitAccount?: StringFilter<"Rule"> | string
    targetCreditAccount?: StringFilter<"Rule"> | string
    targetSuggestedTag?: StringNullableFilter<"Rule"> | string | null
    vatApplicable?: BoolFilter<"Rule"> | boolean
    priority?: IntFilter<"Rule"> | number
    isActive?: BoolFilter<"Rule"> | boolean
    createdAt?: DateTimeFilter<"Rule"> | Date | string
    createdBy?: EnumRuleCreatorFilter<"Rule"> | $Enums.RuleCreator
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }, "id" | "companyId_uniqueKey">

  export type RuleOrderByWithAggregationInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetCreditAccount?: SortOrder
    targetSuggestedTag?: SortOrderInput | SortOrder
    vatApplicable?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    _count?: RuleCountOrderByAggregateInput
    _avg?: RuleAvgOrderByAggregateInput
    _max?: RuleMaxOrderByAggregateInput
    _min?: RuleMinOrderByAggregateInput
    _sum?: RuleSumOrderByAggregateInput
  }

  export type RuleScalarWhereWithAggregatesInput = {
    AND?: RuleScalarWhereWithAggregatesInput | RuleScalarWhereWithAggregatesInput[]
    OR?: RuleScalarWhereWithAggregatesInput[]
    NOT?: RuleScalarWhereWithAggregatesInput | RuleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Rule"> | number
    companyId?: UuidWithAggregatesFilter<"Rule"> | string
    uniqueKey?: StringWithAggregatesFilter<"Rule"> | string
    targetDebitAccount?: StringWithAggregatesFilter<"Rule"> | string
    targetCreditAccount?: StringWithAggregatesFilter<"Rule"> | string
    targetSuggestedTag?: StringNullableWithAggregatesFilter<"Rule"> | string | null
    vatApplicable?: BoolWithAggregatesFilter<"Rule"> | boolean
    priority?: IntWithAggregatesFilter<"Rule"> | number
    isActive?: BoolWithAggregatesFilter<"Rule"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Rule"> | Date | string
    createdBy?: EnumRuleCreatorWithAggregatesFilter<"Rule"> | $Enums.RuleCreator
  }

  export type RuleCandidateWhereInput = {
    AND?: RuleCandidateWhereInput | RuleCandidateWhereInput[]
    OR?: RuleCandidateWhereInput[]
    NOT?: RuleCandidateWhereInput | RuleCandidateWhereInput[]
    id?: IntFilter<"RuleCandidate"> | number
    companyId?: UuidFilter<"RuleCandidate"> | string
    uniqueKey?: StringFilter<"RuleCandidate"> | string
    targetDebitAccount?: StringFilter<"RuleCandidate"> | string
    targetSuggestedTag?: StringNullableFilter<"RuleCandidate"> | string | null
    vatApplicable?: BoolNullableFilter<"RuleCandidate"> | boolean | null
    suggestionCount?: IntFilter<"RuleCandidate"> | number
    lastSuggestedAt?: DateTimeFilter<"RuleCandidate"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }

  export type RuleCandidateOrderByWithRelationInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetSuggestedTag?: SortOrderInput | SortOrder
    vatApplicable?: SortOrderInput | SortOrder
    suggestionCount?: SortOrder
    lastSuggestedAt?: SortOrder
    company?: CompanyOrderByWithRelationInput
  }

  export type RuleCandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    companyId_uniqueKey_targetDebitAccount?: RuleCandidateCompanyIdUniqueKeyTargetDebitAccountCompoundUniqueInput
    AND?: RuleCandidateWhereInput | RuleCandidateWhereInput[]
    OR?: RuleCandidateWhereInput[]
    NOT?: RuleCandidateWhereInput | RuleCandidateWhereInput[]
    companyId?: UuidFilter<"RuleCandidate"> | string
    uniqueKey?: StringFilter<"RuleCandidate"> | string
    targetDebitAccount?: StringFilter<"RuleCandidate"> | string
    targetSuggestedTag?: StringNullableFilter<"RuleCandidate"> | string | null
    vatApplicable?: BoolNullableFilter<"RuleCandidate"> | boolean | null
    suggestionCount?: IntFilter<"RuleCandidate"> | number
    lastSuggestedAt?: DateTimeFilter<"RuleCandidate"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }, "id" | "companyId_uniqueKey_targetDebitAccount">

  export type RuleCandidateOrderByWithAggregationInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetSuggestedTag?: SortOrderInput | SortOrder
    vatApplicable?: SortOrderInput | SortOrder
    suggestionCount?: SortOrder
    lastSuggestedAt?: SortOrder
    _count?: RuleCandidateCountOrderByAggregateInput
    _avg?: RuleCandidateAvgOrderByAggregateInput
    _max?: RuleCandidateMaxOrderByAggregateInput
    _min?: RuleCandidateMinOrderByAggregateInput
    _sum?: RuleCandidateSumOrderByAggregateInput
  }

  export type RuleCandidateScalarWhereWithAggregatesInput = {
    AND?: RuleCandidateScalarWhereWithAggregatesInput | RuleCandidateScalarWhereWithAggregatesInput[]
    OR?: RuleCandidateScalarWhereWithAggregatesInput[]
    NOT?: RuleCandidateScalarWhereWithAggregatesInput | RuleCandidateScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RuleCandidate"> | number
    companyId?: UuidWithAggregatesFilter<"RuleCandidate"> | string
    uniqueKey?: StringWithAggregatesFilter<"RuleCandidate"> | string
    targetDebitAccount?: StringWithAggregatesFilter<"RuleCandidate"> | string
    targetSuggestedTag?: StringNullableWithAggregatesFilter<"RuleCandidate"> | string | null
    vatApplicable?: BoolNullableWithAggregatesFilter<"RuleCandidate"> | boolean | null
    suggestionCount?: IntWithAggregatesFilter<"RuleCandidate"> | number
    lastSuggestedAt?: DateTimeWithAggregatesFilter<"RuleCandidate"> | Date | string
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: BigIntFilter<"Transaction"> | bigint | number
    companyId?: UuidFilter<"Transaction"> | string
    rawText?: StringFilter<"Transaction"> | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    amount?: BigIntFilter<"Transaction"> | bigint | number
    normalizedUniqueKey?: StringNullableFilter<"Transaction"> | string | null
    isAnomaly?: BoolFilter<"Transaction"> | boolean
    anomalyScore?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    llmResponse?: JsonNullableFilter<"Transaction">
    userClarification?: JsonNullableFilter<"Transaction">
    finalDebitAccount?: StringNullableFilter<"Transaction"> | string | null
    finalCreditAccount?: StringNullableFilter<"Transaction"> | string | null
    finalSuggestedTag?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionType?: EnumTransactionIOTypeFilter<"Transaction"> | $Enums.TransactionIOType
    status?: EnumTransactionStatusFilter<"Transaction"> | $Enums.TransactionStatus
    processedBy?: EnumProcessorTypeNullableFilter<"Transaction"> | $Enums.ProcessorType | null
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    companyId?: SortOrder
    rawText?: SortOrder
    transactionDate?: SortOrder
    amount?: SortOrder
    normalizedUniqueKey?: SortOrderInput | SortOrder
    isAnomaly?: SortOrder
    anomalyScore?: SortOrderInput | SortOrder
    llmResponse?: SortOrderInput | SortOrder
    userClarification?: SortOrderInput | SortOrder
    finalDebitAccount?: SortOrderInput | SortOrder
    finalCreditAccount?: SortOrderInput | SortOrder
    finalSuggestedTag?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionType?: SortOrder
    status?: SortOrder
    processedBy?: SortOrderInput | SortOrder
    company?: CompanyOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    companyId?: UuidFilter<"Transaction"> | string
    rawText?: StringFilter<"Transaction"> | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    amount?: BigIntFilter<"Transaction"> | bigint | number
    normalizedUniqueKey?: StringNullableFilter<"Transaction"> | string | null
    isAnomaly?: BoolFilter<"Transaction"> | boolean
    anomalyScore?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    llmResponse?: JsonNullableFilter<"Transaction">
    userClarification?: JsonNullableFilter<"Transaction">
    finalDebitAccount?: StringNullableFilter<"Transaction"> | string | null
    finalCreditAccount?: StringNullableFilter<"Transaction"> | string | null
    finalSuggestedTag?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionType?: EnumTransactionIOTypeFilter<"Transaction"> | $Enums.TransactionIOType
    status?: EnumTransactionStatusFilter<"Transaction"> | $Enums.TransactionStatus
    processedBy?: EnumProcessorTypeNullableFilter<"Transaction"> | $Enums.ProcessorType | null
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    companyId?: SortOrder
    rawText?: SortOrder
    transactionDate?: SortOrder
    amount?: SortOrder
    normalizedUniqueKey?: SortOrderInput | SortOrder
    isAnomaly?: SortOrder
    anomalyScore?: SortOrderInput | SortOrder
    llmResponse?: SortOrderInput | SortOrder
    userClarification?: SortOrderInput | SortOrder
    finalDebitAccount?: SortOrderInput | SortOrder
    finalCreditAccount?: SortOrderInput | SortOrder
    finalSuggestedTag?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionType?: SortOrder
    status?: SortOrder
    processedBy?: SortOrderInput | SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Transaction"> | bigint | number
    companyId?: UuidWithAggregatesFilter<"Transaction"> | string
    rawText?: StringWithAggregatesFilter<"Transaction"> | string
    transactionDate?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    amount?: BigIntWithAggregatesFilter<"Transaction"> | bigint | number
    normalizedUniqueKey?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    isAnomaly?: BoolWithAggregatesFilter<"Transaction"> | boolean
    anomalyScore?: DecimalNullableWithAggregatesFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    llmResponse?: JsonNullableWithAggregatesFilter<"Transaction">
    userClarification?: JsonNullableWithAggregatesFilter<"Transaction">
    finalDebitAccount?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    finalCreditAccount?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    finalSuggestedTag?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    transactionType?: EnumTransactionIOTypeWithAggregatesFilter<"Transaction"> | $Enums.TransactionIOType
    status?: EnumTransactionStatusWithAggregatesFilter<"Transaction"> | $Enums.TransactionStatus
    processedBy?: EnumProcessorTypeNullableWithAggregatesFilter<"Transaction"> | $Enums.ProcessorType | null
  }

  export type DatacollectionGyeonggiDeliveryWhereInput = {
    AND?: DatacollectionGyeonggiDeliveryWhereInput | DatacollectionGyeonggiDeliveryWhereInput[]
    OR?: DatacollectionGyeonggiDeliveryWhereInput[]
    NOT?: DatacollectionGyeonggiDeliveryWhereInput | DatacollectionGyeonggiDeliveryWhereInput[]
    id?: UuidFilter<"DatacollectionGyeonggiDelivery"> | string
    listTotalCount?: IntNullableFilter<"DatacollectionGyeonggiDelivery"> | number | null
    responseCode?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    responseMessage?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    apiVersion?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    businessRegNo?: StringFilter<"DatacollectionGyeonggiDelivery"> | string
    sigunName?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    storeName?: StringFilter<"DatacollectionGyeonggiDelivery"> | string
    industryType?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedRoadAddress?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLotAddress?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedZipcode?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLatitude?: DecimalNullableFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFilter<"DatacollectionGyeonggiDelivery"> | string
    collectionBatchId?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    createdAt?: DateTimeFilter<"DatacollectionGyeonggiDelivery"> | Date | string
    updatedAt?: DateTimeFilter<"DatacollectionGyeonggiDelivery"> | Date | string
  }

  export type DatacollectionGyeonggiDeliveryOrderByWithRelationInput = {
    id?: SortOrder
    listTotalCount?: SortOrderInput | SortOrder
    responseCode?: SortOrderInput | SortOrder
    responseMessage?: SortOrderInput | SortOrder
    apiVersion?: SortOrderInput | SortOrder
    businessRegNo?: SortOrder
    sigunName?: SortOrderInput | SortOrder
    storeName?: SortOrder
    industryType?: SortOrderInput | SortOrder
    refinedRoadAddress?: SortOrderInput | SortOrder
    refinedLotAddress?: SortOrderInput | SortOrder
    refinedZipcode?: SortOrderInput | SortOrder
    refinedLatitude?: SortOrderInput | SortOrder
    refinedLongitude?: SortOrderInput | SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatacollectionGyeonggiDeliveryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    businessRegNo?: string
    AND?: DatacollectionGyeonggiDeliveryWhereInput | DatacollectionGyeonggiDeliveryWhereInput[]
    OR?: DatacollectionGyeonggiDeliveryWhereInput[]
    NOT?: DatacollectionGyeonggiDeliveryWhereInput | DatacollectionGyeonggiDeliveryWhereInput[]
    listTotalCount?: IntNullableFilter<"DatacollectionGyeonggiDelivery"> | number | null
    responseCode?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    responseMessage?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    apiVersion?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    sigunName?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    storeName?: StringFilter<"DatacollectionGyeonggiDelivery"> | string
    industryType?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedRoadAddress?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLotAddress?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedZipcode?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLatitude?: DecimalNullableFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFilter<"DatacollectionGyeonggiDelivery"> | string
    collectionBatchId?: StringNullableFilter<"DatacollectionGyeonggiDelivery"> | string | null
    createdAt?: DateTimeFilter<"DatacollectionGyeonggiDelivery"> | Date | string
    updatedAt?: DateTimeFilter<"DatacollectionGyeonggiDelivery"> | Date | string
  }, "id" | "businessRegNo">

  export type DatacollectionGyeonggiDeliveryOrderByWithAggregationInput = {
    id?: SortOrder
    listTotalCount?: SortOrderInput | SortOrder
    responseCode?: SortOrderInput | SortOrder
    responseMessage?: SortOrderInput | SortOrder
    apiVersion?: SortOrderInput | SortOrder
    businessRegNo?: SortOrder
    sigunName?: SortOrderInput | SortOrder
    storeName?: SortOrder
    industryType?: SortOrderInput | SortOrder
    refinedRoadAddress?: SortOrderInput | SortOrder
    refinedLotAddress?: SortOrderInput | SortOrder
    refinedZipcode?: SortOrderInput | SortOrder
    refinedLatitude?: SortOrderInput | SortOrder
    refinedLongitude?: SortOrderInput | SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DatacollectionGyeonggiDeliveryCountOrderByAggregateInput
    _avg?: DatacollectionGyeonggiDeliveryAvgOrderByAggregateInput
    _max?: DatacollectionGyeonggiDeliveryMaxOrderByAggregateInput
    _min?: DatacollectionGyeonggiDeliveryMinOrderByAggregateInput
    _sum?: DatacollectionGyeonggiDeliverySumOrderByAggregateInput
  }

  export type DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput = {
    AND?: DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput | DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput[]
    OR?: DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput[]
    NOT?: DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput | DatacollectionGyeonggiDeliveryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string
    listTotalCount?: IntNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | number | null
    responseCode?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    responseMessage?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    apiVersion?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    businessRegNo?: StringWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string
    sigunName?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    storeName?: StringWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string
    industryType?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedRoadAddress?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLotAddress?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedZipcode?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    refinedLatitude?: DecimalNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string
    collectionBatchId?: StringNullableWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DatacollectionGyeonggiDelivery"> | Date | string
  }

  export type DatacollectionSeoulRestaurantsWhereInput = {
    AND?: DatacollectionSeoulRestaurantsWhereInput | DatacollectionSeoulRestaurantsWhereInput[]
    OR?: DatacollectionSeoulRestaurantsWhereInput[]
    NOT?: DatacollectionSeoulRestaurantsWhereInput | DatacollectionSeoulRestaurantsWhereInput[]
    id?: UuidFilter<"DatacollectionSeoulRestaurants"> | string
    licenseDate?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusName?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessName?: StringFilter<"DatacollectionSeoulRestaurants"> | string
    businessType?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    dataSource?: StringFilter<"DatacollectionSeoulRestaurants"> | string
    collectionBatchId?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    createdAt?: DateTimeFilter<"DatacollectionSeoulRestaurants"> | Date | string
    updatedAt?: DateTimeFilter<"DatacollectionSeoulRestaurants"> | Date | string
    apiVersion?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessRegistrationNumber?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    licenseExpiryDate?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    listTotalCount?: IntNullableFilter<"DatacollectionSeoulRestaurants"> | number | null
    lotNumberAddress?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    refinedLatitude?: DecimalNullableFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    responseCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    responseMessage?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    roadNameAddress?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    zipCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
  }

  export type DatacollectionSeoulRestaurantsOrderByWithRelationInput = {
    id?: SortOrder
    licenseDate?: SortOrderInput | SortOrder
    businessStatusCode?: SortOrderInput | SortOrder
    businessStatusName?: SortOrderInput | SortOrder
    businessName?: SortOrder
    businessType?: SortOrderInput | SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiVersion?: SortOrderInput | SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    licenseExpiryDate?: SortOrderInput | SortOrder
    listTotalCount?: SortOrderInput | SortOrder
    lotNumberAddress?: SortOrderInput | SortOrder
    refinedLatitude?: SortOrderInput | SortOrder
    refinedLongitude?: SortOrderInput | SortOrder
    responseCode?: SortOrderInput | SortOrder
    responseMessage?: SortOrderInput | SortOrder
    roadNameAddress?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
  }

  export type DatacollectionSeoulRestaurantsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    businessRegistrationNumber?: string
    AND?: DatacollectionSeoulRestaurantsWhereInput | DatacollectionSeoulRestaurantsWhereInput[]
    OR?: DatacollectionSeoulRestaurantsWhereInput[]
    NOT?: DatacollectionSeoulRestaurantsWhereInput | DatacollectionSeoulRestaurantsWhereInput[]
    licenseDate?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusName?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessName?: StringFilter<"DatacollectionSeoulRestaurants"> | string
    businessType?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    dataSource?: StringFilter<"DatacollectionSeoulRestaurants"> | string
    collectionBatchId?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    createdAt?: DateTimeFilter<"DatacollectionSeoulRestaurants"> | Date | string
    updatedAt?: DateTimeFilter<"DatacollectionSeoulRestaurants"> | Date | string
    apiVersion?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    licenseExpiryDate?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    listTotalCount?: IntNullableFilter<"DatacollectionSeoulRestaurants"> | number | null
    lotNumberAddress?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    refinedLatitude?: DecimalNullableFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    responseCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    responseMessage?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    roadNameAddress?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
    zipCode?: StringNullableFilter<"DatacollectionSeoulRestaurants"> | string | null
  }, "id" | "businessRegistrationNumber">

  export type DatacollectionSeoulRestaurantsOrderByWithAggregationInput = {
    id?: SortOrder
    licenseDate?: SortOrderInput | SortOrder
    businessStatusCode?: SortOrderInput | SortOrder
    businessStatusName?: SortOrderInput | SortOrder
    businessName?: SortOrder
    businessType?: SortOrderInput | SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiVersion?: SortOrderInput | SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    licenseExpiryDate?: SortOrderInput | SortOrder
    listTotalCount?: SortOrderInput | SortOrder
    lotNumberAddress?: SortOrderInput | SortOrder
    refinedLatitude?: SortOrderInput | SortOrder
    refinedLongitude?: SortOrderInput | SortOrder
    responseCode?: SortOrderInput | SortOrder
    responseMessage?: SortOrderInput | SortOrder
    roadNameAddress?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
    _count?: DatacollectionSeoulRestaurantsCountOrderByAggregateInput
    _avg?: DatacollectionSeoulRestaurantsAvgOrderByAggregateInput
    _max?: DatacollectionSeoulRestaurantsMaxOrderByAggregateInput
    _min?: DatacollectionSeoulRestaurantsMinOrderByAggregateInput
    _sum?: DatacollectionSeoulRestaurantsSumOrderByAggregateInput
  }

  export type DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput = {
    AND?: DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput | DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput[]
    OR?: DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput[]
    NOT?: DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput | DatacollectionSeoulRestaurantsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string
    licenseDate?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusCode?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessStatusName?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessName?: StringWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string
    businessType?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    dataSource?: StringWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string
    collectionBatchId?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | Date | string
    apiVersion?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    businessRegistrationNumber?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    licenseExpiryDate?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    listTotalCount?: IntNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | number | null
    lotNumberAddress?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    refinedLatitude?: DecimalNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: DecimalNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | Decimal | DecimalJsLike | number | string | null
    responseCode?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    responseMessage?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    roadNameAddress?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
    zipCode?: StringNullableWithAggregatesFilter<"DatacollectionSeoulRestaurants"> | string | null
  }

  export type RuleEngineWhereInput = {
    AND?: RuleEngineWhereInput | RuleEngineWhereInput[]
    OR?: RuleEngineWhereInput[]
    NOT?: RuleEngineWhereInput | RuleEngineWhereInput[]
    id?: UuidFilter<"RuleEngine"> | string
    keyword?: StringFilter<"RuleEngine"> | string
    confidence?: IntFilter<"RuleEngine"> | number
    question?: StringNullableFilter<"RuleEngine"> | string | null
    primaryTag?: StringFilter<"RuleEngine"> | string
    primaryAccount?: StringFilter<"RuleEngine"> | string
    secondaryTag?: StringNullableFilter<"RuleEngine"> | string | null
    secondaryAccount?: StringNullableFilter<"RuleEngine"> | string | null
    usageCount?: IntFilter<"RuleEngine"> | number
    positiveCount?: IntFilter<"RuleEngine"> | number
    negativeCount?: IntFilter<"RuleEngine"> | number
    lastUsed?: DateTimeNullableFilter<"RuleEngine"> | Date | string | null
    isActive?: BoolFilter<"RuleEngine"> | boolean
    createdBy?: StringFilter<"RuleEngine"> | string
    createdAt?: DateTimeFilter<"RuleEngine"> | Date | string
    updatedAt?: DateTimeFilter<"RuleEngine"> | Date | string
  }

  export type RuleEngineOrderByWithRelationInput = {
    id?: SortOrder
    keyword?: SortOrder
    confidence?: SortOrder
    question?: SortOrderInput | SortOrder
    primaryTag?: SortOrder
    primaryAccount?: SortOrder
    secondaryTag?: SortOrderInput | SortOrder
    secondaryAccount?: SortOrderInput | SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RuleEngineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    keyword?: string
    AND?: RuleEngineWhereInput | RuleEngineWhereInput[]
    OR?: RuleEngineWhereInput[]
    NOT?: RuleEngineWhereInput | RuleEngineWhereInput[]
    confidence?: IntFilter<"RuleEngine"> | number
    question?: StringNullableFilter<"RuleEngine"> | string | null
    primaryTag?: StringFilter<"RuleEngine"> | string
    primaryAccount?: StringFilter<"RuleEngine"> | string
    secondaryTag?: StringNullableFilter<"RuleEngine"> | string | null
    secondaryAccount?: StringNullableFilter<"RuleEngine"> | string | null
    usageCount?: IntFilter<"RuleEngine"> | number
    positiveCount?: IntFilter<"RuleEngine"> | number
    negativeCount?: IntFilter<"RuleEngine"> | number
    lastUsed?: DateTimeNullableFilter<"RuleEngine"> | Date | string | null
    isActive?: BoolFilter<"RuleEngine"> | boolean
    createdBy?: StringFilter<"RuleEngine"> | string
    createdAt?: DateTimeFilter<"RuleEngine"> | Date | string
    updatedAt?: DateTimeFilter<"RuleEngine"> | Date | string
  }, "id" | "keyword">

  export type RuleEngineOrderByWithAggregationInput = {
    id?: SortOrder
    keyword?: SortOrder
    confidence?: SortOrder
    question?: SortOrderInput | SortOrder
    primaryTag?: SortOrder
    primaryAccount?: SortOrder
    secondaryTag?: SortOrderInput | SortOrder
    secondaryAccount?: SortOrderInput | SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RuleEngineCountOrderByAggregateInput
    _avg?: RuleEngineAvgOrderByAggregateInput
    _max?: RuleEngineMaxOrderByAggregateInput
    _min?: RuleEngineMinOrderByAggregateInput
    _sum?: RuleEngineSumOrderByAggregateInput
  }

  export type RuleEngineScalarWhereWithAggregatesInput = {
    AND?: RuleEngineScalarWhereWithAggregatesInput | RuleEngineScalarWhereWithAggregatesInput[]
    OR?: RuleEngineScalarWhereWithAggregatesInput[]
    NOT?: RuleEngineScalarWhereWithAggregatesInput | RuleEngineScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RuleEngine"> | string
    keyword?: StringWithAggregatesFilter<"RuleEngine"> | string
    confidence?: IntWithAggregatesFilter<"RuleEngine"> | number
    question?: StringNullableWithAggregatesFilter<"RuleEngine"> | string | null
    primaryTag?: StringWithAggregatesFilter<"RuleEngine"> | string
    primaryAccount?: StringWithAggregatesFilter<"RuleEngine"> | string
    secondaryTag?: StringNullableWithAggregatesFilter<"RuleEngine"> | string | null
    secondaryAccount?: StringNullableWithAggregatesFilter<"RuleEngine"> | string | null
    usageCount?: IntWithAggregatesFilter<"RuleEngine"> | number
    positiveCount?: IntWithAggregatesFilter<"RuleEngine"> | number
    negativeCount?: IntWithAggregatesFilter<"RuleEngine"> | number
    lastUsed?: DateTimeNullableWithAggregatesFilter<"RuleEngine"> | Date | string | null
    isActive?: BoolWithAggregatesFilter<"RuleEngine"> | boolean
    createdBy?: StringWithAggregatesFilter<"RuleEngine"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RuleEngine"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RuleEngine"> | Date | string
  }

  export type RuleEngineCandidateWhereInput = {
    AND?: RuleEngineCandidateWhereInput | RuleEngineCandidateWhereInput[]
    OR?: RuleEngineCandidateWhereInput[]
    NOT?: RuleEngineCandidateWhereInput | RuleEngineCandidateWhereInput[]
    id?: UuidFilter<"RuleEngineCandidate"> | string
    keyword?: StringFilter<"RuleEngineCandidate"> | string
    tag?: StringFilter<"RuleEngineCandidate"> | string
    account?: StringFilter<"RuleEngineCandidate"> | string
    suggestionCount?: IntFilter<"RuleEngineCandidate"> | number
    approvalThreshold?: IntFilter<"RuleEngineCandidate"> | number
    firstSuggested?: DateTimeFilter<"RuleEngineCandidate"> | Date | string
    lastSuggested?: DateTimeFilter<"RuleEngineCandidate"> | Date | string
    isApproved?: BoolFilter<"RuleEngineCandidate"> | boolean
    approvedAt?: DateTimeNullableFilter<"RuleEngineCandidate"> | Date | string | null
    approvedBy?: StringNullableFilter<"RuleEngineCandidate"> | string | null
  }

  export type RuleEngineCandidateOrderByWithRelationInput = {
    id?: SortOrder
    keyword?: SortOrder
    tag?: SortOrder
    account?: SortOrder
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
    firstSuggested?: SortOrder
    lastSuggested?: SortOrder
    isApproved?: SortOrder
    approvedAt?: SortOrderInput | SortOrder
    approvedBy?: SortOrderInput | SortOrder
  }

  export type RuleEngineCandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    keyword_tag_account?: RuleEngineCandidateKeywordTagAccountCompoundUniqueInput
    AND?: RuleEngineCandidateWhereInput | RuleEngineCandidateWhereInput[]
    OR?: RuleEngineCandidateWhereInput[]
    NOT?: RuleEngineCandidateWhereInput | RuleEngineCandidateWhereInput[]
    keyword?: StringFilter<"RuleEngineCandidate"> | string
    tag?: StringFilter<"RuleEngineCandidate"> | string
    account?: StringFilter<"RuleEngineCandidate"> | string
    suggestionCount?: IntFilter<"RuleEngineCandidate"> | number
    approvalThreshold?: IntFilter<"RuleEngineCandidate"> | number
    firstSuggested?: DateTimeFilter<"RuleEngineCandidate"> | Date | string
    lastSuggested?: DateTimeFilter<"RuleEngineCandidate"> | Date | string
    isApproved?: BoolFilter<"RuleEngineCandidate"> | boolean
    approvedAt?: DateTimeNullableFilter<"RuleEngineCandidate"> | Date | string | null
    approvedBy?: StringNullableFilter<"RuleEngineCandidate"> | string | null
  }, "id" | "keyword_tag_account">

  export type RuleEngineCandidateOrderByWithAggregationInput = {
    id?: SortOrder
    keyword?: SortOrder
    tag?: SortOrder
    account?: SortOrder
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
    firstSuggested?: SortOrder
    lastSuggested?: SortOrder
    isApproved?: SortOrder
    approvedAt?: SortOrderInput | SortOrder
    approvedBy?: SortOrderInput | SortOrder
    _count?: RuleEngineCandidateCountOrderByAggregateInput
    _avg?: RuleEngineCandidateAvgOrderByAggregateInput
    _max?: RuleEngineCandidateMaxOrderByAggregateInput
    _min?: RuleEngineCandidateMinOrderByAggregateInput
    _sum?: RuleEngineCandidateSumOrderByAggregateInput
  }

  export type RuleEngineCandidateScalarWhereWithAggregatesInput = {
    AND?: RuleEngineCandidateScalarWhereWithAggregatesInput | RuleEngineCandidateScalarWhereWithAggregatesInput[]
    OR?: RuleEngineCandidateScalarWhereWithAggregatesInput[]
    NOT?: RuleEngineCandidateScalarWhereWithAggregatesInput | RuleEngineCandidateScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RuleEngineCandidate"> | string
    keyword?: StringWithAggregatesFilter<"RuleEngineCandidate"> | string
    tag?: StringWithAggregatesFilter<"RuleEngineCandidate"> | string
    account?: StringWithAggregatesFilter<"RuleEngineCandidate"> | string
    suggestionCount?: IntWithAggregatesFilter<"RuleEngineCandidate"> | number
    approvalThreshold?: IntWithAggregatesFilter<"RuleEngineCandidate"> | number
    firstSuggested?: DateTimeWithAggregatesFilter<"RuleEngineCandidate"> | Date | string
    lastSuggested?: DateTimeWithAggregatesFilter<"RuleEngineCandidate"> | Date | string
    isApproved?: BoolWithAggregatesFilter<"RuleEngineCandidate"> | boolean
    approvedAt?: DateTimeNullableWithAggregatesFilter<"RuleEngineCandidate"> | Date | string | null
    approvedBy?: StringNullableWithAggregatesFilter<"RuleEngineCandidate"> | string | null
  }

  export type RuleEngineFeedbackWhereInput = {
    AND?: RuleEngineFeedbackWhereInput | RuleEngineFeedbackWhereInput[]
    OR?: RuleEngineFeedbackWhereInput[]
    NOT?: RuleEngineFeedbackWhereInput | RuleEngineFeedbackWhereInput[]
    id?: UuidFilter<"RuleEngineFeedback"> | string
    ruleId?: UuidNullableFilter<"RuleEngineFeedback"> | string | null
    transactionText?: StringFilter<"RuleEngineFeedback"> | string
    normalizedText?: StringFilter<"RuleEngineFeedback"> | string
    selectedOption?: IntFilter<"RuleEngineFeedback"> | number
    selectedTag?: StringFilter<"RuleEngineFeedback"> | string
    selectedAccount?: StringFilter<"RuleEngineFeedback"> | string
    feedbackType?: StringFilter<"RuleEngineFeedback"> | string
    createdAt?: DateTimeFilter<"RuleEngineFeedback"> | Date | string
  }

  export type RuleEngineFeedbackOrderByWithRelationInput = {
    id?: SortOrder
    ruleId?: SortOrderInput | SortOrder
    transactionText?: SortOrder
    normalizedText?: SortOrder
    selectedOption?: SortOrder
    selectedTag?: SortOrder
    selectedAccount?: SortOrder
    feedbackType?: SortOrder
    createdAt?: SortOrder
  }

  export type RuleEngineFeedbackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RuleEngineFeedbackWhereInput | RuleEngineFeedbackWhereInput[]
    OR?: RuleEngineFeedbackWhereInput[]
    NOT?: RuleEngineFeedbackWhereInput | RuleEngineFeedbackWhereInput[]
    ruleId?: UuidNullableFilter<"RuleEngineFeedback"> | string | null
    transactionText?: StringFilter<"RuleEngineFeedback"> | string
    normalizedText?: StringFilter<"RuleEngineFeedback"> | string
    selectedOption?: IntFilter<"RuleEngineFeedback"> | number
    selectedTag?: StringFilter<"RuleEngineFeedback"> | string
    selectedAccount?: StringFilter<"RuleEngineFeedback"> | string
    feedbackType?: StringFilter<"RuleEngineFeedback"> | string
    createdAt?: DateTimeFilter<"RuleEngineFeedback"> | Date | string
  }, "id">

  export type RuleEngineFeedbackOrderByWithAggregationInput = {
    id?: SortOrder
    ruleId?: SortOrderInput | SortOrder
    transactionText?: SortOrder
    normalizedText?: SortOrder
    selectedOption?: SortOrder
    selectedTag?: SortOrder
    selectedAccount?: SortOrder
    feedbackType?: SortOrder
    createdAt?: SortOrder
    _count?: RuleEngineFeedbackCountOrderByAggregateInput
    _avg?: RuleEngineFeedbackAvgOrderByAggregateInput
    _max?: RuleEngineFeedbackMaxOrderByAggregateInput
    _min?: RuleEngineFeedbackMinOrderByAggregateInput
    _sum?: RuleEngineFeedbackSumOrderByAggregateInput
  }

  export type RuleEngineFeedbackScalarWhereWithAggregatesInput = {
    AND?: RuleEngineFeedbackScalarWhereWithAggregatesInput | RuleEngineFeedbackScalarWhereWithAggregatesInput[]
    OR?: RuleEngineFeedbackScalarWhereWithAggregatesInput[]
    NOT?: RuleEngineFeedbackScalarWhereWithAggregatesInput | RuleEngineFeedbackScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RuleEngineFeedback"> | string
    ruleId?: UuidNullableWithAggregatesFilter<"RuleEngineFeedback"> | string | null
    transactionText?: StringWithAggregatesFilter<"RuleEngineFeedback"> | string
    normalizedText?: StringWithAggregatesFilter<"RuleEngineFeedback"> | string
    selectedOption?: IntWithAggregatesFilter<"RuleEngineFeedback"> | number
    selectedTag?: StringWithAggregatesFilter<"RuleEngineFeedback"> | string
    selectedAccount?: StringWithAggregatesFilter<"RuleEngineFeedback"> | string
    feedbackType?: StringWithAggregatesFilter<"RuleEngineFeedback"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RuleEngineFeedback"> | Date | string
  }

  export type FranchiseBrandsWhereInput = {
    AND?: FranchiseBrandsWhereInput | FranchiseBrandsWhereInput[]
    OR?: FranchiseBrandsWhereInput[]
    NOT?: FranchiseBrandsWhereInput | FranchiseBrandsWhereInput[]
    id?: IntFilter<"FranchiseBrands"> | number
    businessYear?: StringFilter<"FranchiseBrands"> | string
    brandId?: StringFilter<"FranchiseBrands"> | string
    headquartersId?: StringNullableFilter<"FranchiseBrands"> | string | null
    businessRegistrationNumber?: StringNullableFilter<"FranchiseBrands"> | string | null
    corporateRegistrationNumber?: StringNullableFilter<"FranchiseBrands"> | string | null
    representativeName?: StringNullableFilter<"FranchiseBrands"> | string | null
    brandName?: StringFilter<"FranchiseBrands"> | string
    industryLargeCategory?: StringNullableFilter<"FranchiseBrands"> | string | null
    industryMediumCategory?: StringNullableFilter<"FranchiseBrands"> | string | null
    mainProduct?: StringNullableFilter<"FranchiseBrands"> | string | null
    businessStartDate?: DateTimeNullableFilter<"FranchiseBrands"> | Date | string | null
    companyName?: StringNullableFilter<"FranchiseBrands"> | string | null
    createdAt?: DateTimeFilter<"FranchiseBrands"> | Date | string
    updatedAt?: DateTimeFilter<"FranchiseBrands"> | Date | string
  }

  export type FranchiseBrandsOrderByWithRelationInput = {
    id?: SortOrder
    businessYear?: SortOrder
    brandId?: SortOrder
    headquartersId?: SortOrderInput | SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    corporateRegistrationNumber?: SortOrderInput | SortOrder
    representativeName?: SortOrderInput | SortOrder
    brandName?: SortOrder
    industryLargeCategory?: SortOrderInput | SortOrder
    industryMediumCategory?: SortOrderInput | SortOrder
    mainProduct?: SortOrderInput | SortOrder
    businessStartDate?: SortOrderInput | SortOrder
    companyName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FranchiseBrandsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    brandId?: string
    brandId_businessYear?: FranchiseBrandsBrandIdBusinessYearCompoundUniqueInput
    AND?: FranchiseBrandsWhereInput | FranchiseBrandsWhereInput[]
    OR?: FranchiseBrandsWhereInput[]
    NOT?: FranchiseBrandsWhereInput | FranchiseBrandsWhereInput[]
    businessYear?: StringFilter<"FranchiseBrands"> | string
    headquartersId?: StringNullableFilter<"FranchiseBrands"> | string | null
    businessRegistrationNumber?: StringNullableFilter<"FranchiseBrands"> | string | null
    corporateRegistrationNumber?: StringNullableFilter<"FranchiseBrands"> | string | null
    representativeName?: StringNullableFilter<"FranchiseBrands"> | string | null
    brandName?: StringFilter<"FranchiseBrands"> | string
    industryLargeCategory?: StringNullableFilter<"FranchiseBrands"> | string | null
    industryMediumCategory?: StringNullableFilter<"FranchiseBrands"> | string | null
    mainProduct?: StringNullableFilter<"FranchiseBrands"> | string | null
    businessStartDate?: DateTimeNullableFilter<"FranchiseBrands"> | Date | string | null
    companyName?: StringNullableFilter<"FranchiseBrands"> | string | null
    createdAt?: DateTimeFilter<"FranchiseBrands"> | Date | string
    updatedAt?: DateTimeFilter<"FranchiseBrands"> | Date | string
  }, "id" | "brandId" | "brandId_businessYear">

  export type FranchiseBrandsOrderByWithAggregationInput = {
    id?: SortOrder
    businessYear?: SortOrder
    brandId?: SortOrder
    headquartersId?: SortOrderInput | SortOrder
    businessRegistrationNumber?: SortOrderInput | SortOrder
    corporateRegistrationNumber?: SortOrderInput | SortOrder
    representativeName?: SortOrderInput | SortOrder
    brandName?: SortOrder
    industryLargeCategory?: SortOrderInput | SortOrder
    industryMediumCategory?: SortOrderInput | SortOrder
    mainProduct?: SortOrderInput | SortOrder
    businessStartDate?: SortOrderInput | SortOrder
    companyName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FranchiseBrandsCountOrderByAggregateInput
    _avg?: FranchiseBrandsAvgOrderByAggregateInput
    _max?: FranchiseBrandsMaxOrderByAggregateInput
    _min?: FranchiseBrandsMinOrderByAggregateInput
    _sum?: FranchiseBrandsSumOrderByAggregateInput
  }

  export type FranchiseBrandsScalarWhereWithAggregatesInput = {
    AND?: FranchiseBrandsScalarWhereWithAggregatesInput | FranchiseBrandsScalarWhereWithAggregatesInput[]
    OR?: FranchiseBrandsScalarWhereWithAggregatesInput[]
    NOT?: FranchiseBrandsScalarWhereWithAggregatesInput | FranchiseBrandsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"FranchiseBrands"> | number
    businessYear?: StringWithAggregatesFilter<"FranchiseBrands"> | string
    brandId?: StringWithAggregatesFilter<"FranchiseBrands"> | string
    headquartersId?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    businessRegistrationNumber?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    corporateRegistrationNumber?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    representativeName?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    brandName?: StringWithAggregatesFilter<"FranchiseBrands"> | string
    industryLargeCategory?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    industryMediumCategory?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    mainProduct?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    businessStartDate?: DateTimeNullableWithAggregatesFilter<"FranchiseBrands"> | Date | string | null
    companyName?: StringNullableWithAggregatesFilter<"FranchiseBrands"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FranchiseBrands"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FranchiseBrands"> | Date | string
  }

  export type NationalPensionWorkplacesWhereInput = {
    AND?: NationalPensionWorkplacesWhereInput | NationalPensionWorkplacesWhereInput[]
    OR?: NationalPensionWorkplacesWhereInput[]
    NOT?: NationalPensionWorkplacesWhereInput | NationalPensionWorkplacesWhereInput[]
    id?: IntFilter<"NationalPensionWorkplaces"> | number
    dataYearMonth?: StringFilter<"NationalPensionWorkplaces"> | string
    workplaceName?: StringFilter<"NationalPensionWorkplaces"> | string
    businessRegistrationNumber?: StringFilter<"NationalPensionWorkplaces"> | string
    workplaceStatusCode?: IntFilter<"NationalPensionWorkplaces"> | number
    postalCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    addressJibun?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    addressRoad?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    legalDongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    adminDongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    sidoCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    sigunguCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    eubmyeondongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    workplaceTypeCode?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    industryCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    industryName?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    applicationDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    reRegistrationDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    withdrawalDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    memberCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    monthlyNoticeAmount?: BigIntNullableFilter<"NationalPensionWorkplaces"> | bigint | number | null
    newAcquisitionCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    lossCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    createdAt?: DateTimeFilter<"NationalPensionWorkplaces"> | Date | string
    updatedAt?: DateTimeFilter<"NationalPensionWorkplaces"> | Date | string
  }

  export type NationalPensionWorkplacesOrderByWithRelationInput = {
    id?: SortOrder
    dataYearMonth?: SortOrder
    workplaceName?: SortOrder
    businessRegistrationNumber?: SortOrder
    workplaceStatusCode?: SortOrder
    postalCode?: SortOrderInput | SortOrder
    addressJibun?: SortOrderInput | SortOrder
    addressRoad?: SortOrderInput | SortOrder
    legalDongCode?: SortOrderInput | SortOrder
    adminDongCode?: SortOrderInput | SortOrder
    sidoCode?: SortOrderInput | SortOrder
    sigunguCode?: SortOrderInput | SortOrder
    eubmyeondongCode?: SortOrderInput | SortOrder
    workplaceTypeCode?: SortOrderInput | SortOrder
    industryCode?: SortOrderInput | SortOrder
    industryName?: SortOrderInput | SortOrder
    applicationDate?: SortOrderInput | SortOrder
    reRegistrationDate?: SortOrderInput | SortOrder
    withdrawalDate?: SortOrderInput | SortOrder
    memberCount?: SortOrderInput | SortOrder
    monthlyNoticeAmount?: SortOrderInput | SortOrder
    newAcquisitionCount?: SortOrderInput | SortOrder
    lossCount?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NationalPensionWorkplacesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: NationalPensionWorkplacesWhereInput | NationalPensionWorkplacesWhereInput[]
    OR?: NationalPensionWorkplacesWhereInput[]
    NOT?: NationalPensionWorkplacesWhereInput | NationalPensionWorkplacesWhereInput[]
    dataYearMonth?: StringFilter<"NationalPensionWorkplaces"> | string
    workplaceName?: StringFilter<"NationalPensionWorkplaces"> | string
    businessRegistrationNumber?: StringFilter<"NationalPensionWorkplaces"> | string
    workplaceStatusCode?: IntFilter<"NationalPensionWorkplaces"> | number
    postalCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    addressJibun?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    addressRoad?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    legalDongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    adminDongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    sidoCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    sigunguCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    eubmyeondongCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    workplaceTypeCode?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    industryCode?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    industryName?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    applicationDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    reRegistrationDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    withdrawalDate?: StringNullableFilter<"NationalPensionWorkplaces"> | string | null
    memberCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    monthlyNoticeAmount?: BigIntNullableFilter<"NationalPensionWorkplaces"> | bigint | number | null
    newAcquisitionCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    lossCount?: IntNullableFilter<"NationalPensionWorkplaces"> | number | null
    createdAt?: DateTimeFilter<"NationalPensionWorkplaces"> | Date | string
    updatedAt?: DateTimeFilter<"NationalPensionWorkplaces"> | Date | string
  }, "id">

  export type NationalPensionWorkplacesOrderByWithAggregationInput = {
    id?: SortOrder
    dataYearMonth?: SortOrder
    workplaceName?: SortOrder
    businessRegistrationNumber?: SortOrder
    workplaceStatusCode?: SortOrder
    postalCode?: SortOrderInput | SortOrder
    addressJibun?: SortOrderInput | SortOrder
    addressRoad?: SortOrderInput | SortOrder
    legalDongCode?: SortOrderInput | SortOrder
    adminDongCode?: SortOrderInput | SortOrder
    sidoCode?: SortOrderInput | SortOrder
    sigunguCode?: SortOrderInput | SortOrder
    eubmyeondongCode?: SortOrderInput | SortOrder
    workplaceTypeCode?: SortOrderInput | SortOrder
    industryCode?: SortOrderInput | SortOrder
    industryName?: SortOrderInput | SortOrder
    applicationDate?: SortOrderInput | SortOrder
    reRegistrationDate?: SortOrderInput | SortOrder
    withdrawalDate?: SortOrderInput | SortOrder
    memberCount?: SortOrderInput | SortOrder
    monthlyNoticeAmount?: SortOrderInput | SortOrder
    newAcquisitionCount?: SortOrderInput | SortOrder
    lossCount?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NationalPensionWorkplacesCountOrderByAggregateInput
    _avg?: NationalPensionWorkplacesAvgOrderByAggregateInput
    _max?: NationalPensionWorkplacesMaxOrderByAggregateInput
    _min?: NationalPensionWorkplacesMinOrderByAggregateInput
    _sum?: NationalPensionWorkplacesSumOrderByAggregateInput
  }

  export type NationalPensionWorkplacesScalarWhereWithAggregatesInput = {
    AND?: NationalPensionWorkplacesScalarWhereWithAggregatesInput | NationalPensionWorkplacesScalarWhereWithAggregatesInput[]
    OR?: NationalPensionWorkplacesScalarWhereWithAggregatesInput[]
    NOT?: NationalPensionWorkplacesScalarWhereWithAggregatesInput | NationalPensionWorkplacesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"NationalPensionWorkplaces"> | number
    dataYearMonth?: StringWithAggregatesFilter<"NationalPensionWorkplaces"> | string
    workplaceName?: StringWithAggregatesFilter<"NationalPensionWorkplaces"> | string
    businessRegistrationNumber?: StringWithAggregatesFilter<"NationalPensionWorkplaces"> | string
    workplaceStatusCode?: IntWithAggregatesFilter<"NationalPensionWorkplaces"> | number
    postalCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    addressJibun?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    addressRoad?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    legalDongCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    adminDongCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    sidoCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    sigunguCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    eubmyeondongCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    workplaceTypeCode?: IntNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | number | null
    industryCode?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    industryName?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    applicationDate?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    reRegistrationDate?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    withdrawalDate?: StringNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | string | null
    memberCount?: IntNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | number | null
    monthlyNoticeAmount?: BigIntNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | bigint | number | null
    newAcquisitionCount?: IntNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | number | null
    lossCount?: IntNullableWithAggregatesFilter<"NationalPensionWorkplaces"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"NationalPensionWorkplaces"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"NationalPensionWorkplaces"> | Date | string
  }

  export type CompanyCreateInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateCreateNestedManyWithoutCompanyInput
    rules?: RuleCreateNestedManyWithoutCompanyInput
    transactions?: TransactionCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedCreateNestedManyWithoutCompanyInput
    rules?: RuleUncheckedCreateNestedManyWithoutCompanyInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUpdateManyWithoutCompanyNestedInput
    rules?: RuleUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedUpdateManyWithoutCompanyNestedInput
    rules?: RuleUncheckedUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateManyInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
  }

  export type CompanyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
  }

  export type CompanyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
  }

  export type TransactionCacheCreateInput = {
    rawTextHash: string
    rawText: string
    uniqueKey: string
    createdAt?: Date | string
  }

  export type TransactionCacheUncheckedCreateInput = {
    rawTextHash: string
    rawText: string
    uniqueKey: string
    createdAt?: Date | string
  }

  export type TransactionCacheUpdateInput = {
    rawTextHash?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCacheUncheckedUpdateInput = {
    rawTextHash?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCacheCreateManyInput = {
    rawTextHash: string
    rawText: string
    uniqueKey: string
    createdAt?: Date | string
  }

  export type TransactionCacheUpdateManyMutationInput = {
    rawTextHash?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCacheUncheckedUpdateManyInput = {
    rawTextHash?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleCreateInput = {
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
    company: CompanyCreateNestedOneWithoutRulesInput
  }

  export type RuleUncheckedCreateInput = {
    id?: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
  }

  export type RuleUpdateInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
    company?: CompanyUpdateOneRequiredWithoutRulesNestedInput
  }

  export type RuleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type RuleCreateManyInput = {
    id?: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
  }

  export type RuleUpdateManyMutationInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type RuleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type RuleCandidateCreateInput = {
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
    company: CompanyCreateNestedOneWithoutRuleCandidatesInput
  }

  export type RuleCandidateUncheckedCreateInput = {
    id?: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
  }

  export type RuleCandidateUpdateInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutRuleCandidatesNestedInput
  }

  export type RuleCandidateUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleCandidateCreateManyInput = {
    id?: number
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
  }

  export type RuleCandidateUpdateManyMutationInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleCandidateUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: StringFieldUpdateOperationsInput | string
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateInput = {
    id?: bigint | number
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
    company: CompanyCreateNestedOneWithoutTransactionsInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: bigint | number
    companyId: string
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
  }

  export type TransactionUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
    company?: CompanyUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    companyId?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }

  export type TransactionCreateManyInput = {
    id?: bigint | number
    companyId: string
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
  }

  export type TransactionUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    companyId?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }

  export type DatacollectionGyeonggiDeliveryCreateInput = {
    id?: string
    listTotalCount?: number | null
    responseCode?: string | null
    responseMessage?: string | null
    apiVersion?: string | null
    businessRegNo: string
    sigunName?: string | null
    storeName: string
    industryType?: string | null
    refinedRoadAddress?: string | null
    refinedLotAddress?: string | null
    refinedZipcode?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatacollectionGyeonggiDeliveryUncheckedCreateInput = {
    id?: string
    listTotalCount?: number | null
    responseCode?: string | null
    responseMessage?: string | null
    apiVersion?: string | null
    businessRegNo: string
    sigunName?: string | null
    storeName: string
    industryType?: string | null
    refinedRoadAddress?: string | null
    refinedLotAddress?: string | null
    refinedZipcode?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatacollectionGyeonggiDeliveryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegNo?: StringFieldUpdateOperationsInput | string
    sigunName?: NullableStringFieldUpdateOperationsInput | string | null
    storeName?: StringFieldUpdateOperationsInput | string
    industryType?: NullableStringFieldUpdateOperationsInput | string | null
    refinedRoadAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLotAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedZipcode?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatacollectionGyeonggiDeliveryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegNo?: StringFieldUpdateOperationsInput | string
    sigunName?: NullableStringFieldUpdateOperationsInput | string | null
    storeName?: StringFieldUpdateOperationsInput | string
    industryType?: NullableStringFieldUpdateOperationsInput | string | null
    refinedRoadAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLotAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedZipcode?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatacollectionGyeonggiDeliveryCreateManyInput = {
    id?: string
    listTotalCount?: number | null
    responseCode?: string | null
    responseMessage?: string | null
    apiVersion?: string | null
    businessRegNo: string
    sigunName?: string | null
    storeName: string
    industryType?: string | null
    refinedRoadAddress?: string | null
    refinedLotAddress?: string | null
    refinedZipcode?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatacollectionGyeonggiDeliveryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegNo?: StringFieldUpdateOperationsInput | string
    sigunName?: NullableStringFieldUpdateOperationsInput | string | null
    storeName?: StringFieldUpdateOperationsInput | string
    industryType?: NullableStringFieldUpdateOperationsInput | string | null
    refinedRoadAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLotAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedZipcode?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatacollectionGyeonggiDeliveryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegNo?: StringFieldUpdateOperationsInput | string
    sigunName?: NullableStringFieldUpdateOperationsInput | string | null
    storeName?: StringFieldUpdateOperationsInput | string
    industryType?: NullableStringFieldUpdateOperationsInput | string | null
    refinedRoadAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLotAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedZipcode?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatacollectionSeoulRestaurantsCreateInput = {
    id?: string
    licenseDate?: string | null
    businessStatusCode?: string | null
    businessStatusName?: string | null
    businessName: string
    businessType?: string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    apiVersion?: string | null
    businessRegistrationNumber?: string | null
    licenseExpiryDate?: string | null
    listTotalCount?: number | null
    lotNumberAddress?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    responseCode?: string | null
    responseMessage?: string | null
    roadNameAddress?: string | null
    zipCode?: string | null
  }

  export type DatacollectionSeoulRestaurantsUncheckedCreateInput = {
    id?: string
    licenseDate?: string | null
    businessStatusCode?: string | null
    businessStatusName?: string | null
    businessName: string
    businessType?: string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    apiVersion?: string | null
    businessRegistrationNumber?: string | null
    licenseExpiryDate?: string | null
    listTotalCount?: number | null
    lotNumberAddress?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    responseCode?: string | null
    responseMessage?: string | null
    roadNameAddress?: string | null
    zipCode?: string | null
  }

  export type DatacollectionSeoulRestaurantsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    licenseDate?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusCode?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusName?: NullableStringFieldUpdateOperationsInput | string | null
    businessName?: StringFieldUpdateOperationsInput | string
    businessType?: NullableStringFieldUpdateOperationsInput | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiryDate?: NullableStringFieldUpdateOperationsInput | string | null
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    lotNumberAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    roadNameAddress?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DatacollectionSeoulRestaurantsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    licenseDate?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusCode?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusName?: NullableStringFieldUpdateOperationsInput | string | null
    businessName?: StringFieldUpdateOperationsInput | string
    businessType?: NullableStringFieldUpdateOperationsInput | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiryDate?: NullableStringFieldUpdateOperationsInput | string | null
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    lotNumberAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    roadNameAddress?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DatacollectionSeoulRestaurantsCreateManyInput = {
    id?: string
    licenseDate?: string | null
    businessStatusCode?: string | null
    businessStatusName?: string | null
    businessName: string
    businessType?: string | null
    dataSource?: string
    collectionBatchId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    apiVersion?: string | null
    businessRegistrationNumber?: string | null
    licenseExpiryDate?: string | null
    listTotalCount?: number | null
    lotNumberAddress?: string | null
    refinedLatitude?: Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: Decimal | DecimalJsLike | number | string | null
    responseCode?: string | null
    responseMessage?: string | null
    roadNameAddress?: string | null
    zipCode?: string | null
  }

  export type DatacollectionSeoulRestaurantsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    licenseDate?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusCode?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusName?: NullableStringFieldUpdateOperationsInput | string | null
    businessName?: StringFieldUpdateOperationsInput | string
    businessType?: NullableStringFieldUpdateOperationsInput | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiryDate?: NullableStringFieldUpdateOperationsInput | string | null
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    lotNumberAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    roadNameAddress?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DatacollectionSeoulRestaurantsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    licenseDate?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusCode?: NullableStringFieldUpdateOperationsInput | string | null
    businessStatusName?: NullableStringFieldUpdateOperationsInput | string | null
    businessName?: StringFieldUpdateOperationsInput | string
    businessType?: NullableStringFieldUpdateOperationsInput | string | null
    dataSource?: StringFieldUpdateOperationsInput | string
    collectionBatchId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiVersion?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiryDate?: NullableStringFieldUpdateOperationsInput | string | null
    listTotalCount?: NullableIntFieldUpdateOperationsInput | number | null
    lotNumberAddress?: NullableStringFieldUpdateOperationsInput | string | null
    refinedLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    refinedLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    responseCode?: NullableStringFieldUpdateOperationsInput | string | null
    responseMessage?: NullableStringFieldUpdateOperationsInput | string | null
    roadNameAddress?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RuleEngineCreateInput = {
    id?: string
    keyword: string
    confidence?: number
    question?: string | null
    primaryTag: string
    primaryAccount: string
    secondaryTag?: string | null
    secondaryAccount?: string | null
    usageCount?: number
    positiveCount?: number
    negativeCount?: number
    lastUsed?: Date | string | null
    isActive?: boolean
    createdBy?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RuleEngineUncheckedCreateInput = {
    id?: string
    keyword: string
    confidence?: number
    question?: string | null
    primaryTag: string
    primaryAccount: string
    secondaryTag?: string | null
    secondaryAccount?: string | null
    usageCount?: number
    positiveCount?: number
    negativeCount?: number
    lastUsed?: Date | string | null
    isActive?: boolean
    createdBy?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RuleEngineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    confidence?: IntFieldUpdateOperationsInput | number
    question?: NullableStringFieldUpdateOperationsInput | string | null
    primaryTag?: StringFieldUpdateOperationsInput | string
    primaryAccount?: StringFieldUpdateOperationsInput | string
    secondaryTag?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryAccount?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    positiveCount?: IntFieldUpdateOperationsInput | number
    negativeCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    confidence?: IntFieldUpdateOperationsInput | number
    question?: NullableStringFieldUpdateOperationsInput | string | null
    primaryTag?: StringFieldUpdateOperationsInput | string
    primaryAccount?: StringFieldUpdateOperationsInput | string
    secondaryTag?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryAccount?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    positiveCount?: IntFieldUpdateOperationsInput | number
    negativeCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineCreateManyInput = {
    id?: string
    keyword: string
    confidence?: number
    question?: string | null
    primaryTag: string
    primaryAccount: string
    secondaryTag?: string | null
    secondaryAccount?: string | null
    usageCount?: number
    positiveCount?: number
    negativeCount?: number
    lastUsed?: Date | string | null
    isActive?: boolean
    createdBy?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RuleEngineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    confidence?: IntFieldUpdateOperationsInput | number
    question?: NullableStringFieldUpdateOperationsInput | string | null
    primaryTag?: StringFieldUpdateOperationsInput | string
    primaryAccount?: StringFieldUpdateOperationsInput | string
    secondaryTag?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryAccount?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    positiveCount?: IntFieldUpdateOperationsInput | number
    negativeCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    confidence?: IntFieldUpdateOperationsInput | number
    question?: NullableStringFieldUpdateOperationsInput | string | null
    primaryTag?: StringFieldUpdateOperationsInput | string
    primaryAccount?: StringFieldUpdateOperationsInput | string
    secondaryTag?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryAccount?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    positiveCount?: IntFieldUpdateOperationsInput | number
    negativeCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineCandidateCreateInput = {
    id?: string
    keyword: string
    tag: string
    account: string
    suggestionCount?: number
    approvalThreshold?: number
    firstSuggested?: Date | string
    lastSuggested?: Date | string
    isApproved?: boolean
    approvedAt?: Date | string | null
    approvedBy?: string | null
  }

  export type RuleEngineCandidateUncheckedCreateInput = {
    id?: string
    keyword: string
    tag: string
    account: string
    suggestionCount?: number
    approvalThreshold?: number
    firstSuggested?: Date | string
    lastSuggested?: Date | string
    isApproved?: boolean
    approvedAt?: Date | string | null
    approvedBy?: string | null
  }

  export type RuleEngineCandidateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    account?: StringFieldUpdateOperationsInput | string
    suggestionCount?: IntFieldUpdateOperationsInput | number
    approvalThreshold?: IntFieldUpdateOperationsInput | number
    firstSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    isApproved?: BoolFieldUpdateOperationsInput | boolean
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RuleEngineCandidateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    account?: StringFieldUpdateOperationsInput | string
    suggestionCount?: IntFieldUpdateOperationsInput | number
    approvalThreshold?: IntFieldUpdateOperationsInput | number
    firstSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    isApproved?: BoolFieldUpdateOperationsInput | boolean
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RuleEngineCandidateCreateManyInput = {
    id?: string
    keyword: string
    tag: string
    account: string
    suggestionCount?: number
    approvalThreshold?: number
    firstSuggested?: Date | string
    lastSuggested?: Date | string
    isApproved?: boolean
    approvedAt?: Date | string | null
    approvedBy?: string | null
  }

  export type RuleEngineCandidateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    account?: StringFieldUpdateOperationsInput | string
    suggestionCount?: IntFieldUpdateOperationsInput | number
    approvalThreshold?: IntFieldUpdateOperationsInput | number
    firstSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    isApproved?: BoolFieldUpdateOperationsInput | boolean
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RuleEngineCandidateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyword?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    account?: StringFieldUpdateOperationsInput | string
    suggestionCount?: IntFieldUpdateOperationsInput | number
    approvalThreshold?: IntFieldUpdateOperationsInput | number
    firstSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSuggested?: DateTimeFieldUpdateOperationsInput | Date | string
    isApproved?: BoolFieldUpdateOperationsInput | boolean
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RuleEngineFeedbackCreateInput = {
    id?: string
    ruleId?: string | null
    transactionText: string
    normalizedText: string
    selectedOption: number
    selectedTag: string
    selectedAccount: string
    feedbackType: string
    createdAt?: Date | string
  }

  export type RuleEngineFeedbackUncheckedCreateInput = {
    id?: string
    ruleId?: string | null
    transactionText: string
    normalizedText: string
    selectedOption: number
    selectedTag: string
    selectedAccount: string
    feedbackType: string
    createdAt?: Date | string
  }

  export type RuleEngineFeedbackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ruleId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionText?: StringFieldUpdateOperationsInput | string
    normalizedText?: StringFieldUpdateOperationsInput | string
    selectedOption?: IntFieldUpdateOperationsInput | number
    selectedTag?: StringFieldUpdateOperationsInput | string
    selectedAccount?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineFeedbackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ruleId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionText?: StringFieldUpdateOperationsInput | string
    normalizedText?: StringFieldUpdateOperationsInput | string
    selectedOption?: IntFieldUpdateOperationsInput | number
    selectedTag?: StringFieldUpdateOperationsInput | string
    selectedAccount?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineFeedbackCreateManyInput = {
    id?: string
    ruleId?: string | null
    transactionText: string
    normalizedText: string
    selectedOption: number
    selectedTag: string
    selectedAccount: string
    feedbackType: string
    createdAt?: Date | string
  }

  export type RuleEngineFeedbackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ruleId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionText?: StringFieldUpdateOperationsInput | string
    normalizedText?: StringFieldUpdateOperationsInput | string
    selectedOption?: IntFieldUpdateOperationsInput | number
    selectedTag?: StringFieldUpdateOperationsInput | string
    selectedAccount?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleEngineFeedbackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ruleId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionText?: StringFieldUpdateOperationsInput | string
    normalizedText?: StringFieldUpdateOperationsInput | string
    selectedOption?: IntFieldUpdateOperationsInput | number
    selectedTag?: StringFieldUpdateOperationsInput | string
    selectedAccount?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FranchiseBrandsCreateInput = {
    businessYear: string
    brandId: string
    headquartersId?: string | null
    businessRegistrationNumber?: string | null
    corporateRegistrationNumber?: string | null
    representativeName?: string | null
    brandName: string
    industryLargeCategory?: string | null
    industryMediumCategory?: string | null
    mainProduct?: string | null
    businessStartDate?: Date | string | null
    companyName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FranchiseBrandsUncheckedCreateInput = {
    id?: number
    businessYear: string
    brandId: string
    headquartersId?: string | null
    businessRegistrationNumber?: string | null
    corporateRegistrationNumber?: string | null
    representativeName?: string | null
    brandName: string
    industryLargeCategory?: string | null
    industryMediumCategory?: string | null
    mainProduct?: string | null
    businessStartDate?: Date | string | null
    companyName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FranchiseBrandsUpdateInput = {
    businessYear?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    headquartersId?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    corporateRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    representativeName?: NullableStringFieldUpdateOperationsInput | string | null
    brandName?: StringFieldUpdateOperationsInput | string
    industryLargeCategory?: NullableStringFieldUpdateOperationsInput | string | null
    industryMediumCategory?: NullableStringFieldUpdateOperationsInput | string | null
    mainProduct?: NullableStringFieldUpdateOperationsInput | string | null
    businessStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FranchiseBrandsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessYear?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    headquartersId?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    corporateRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    representativeName?: NullableStringFieldUpdateOperationsInput | string | null
    brandName?: StringFieldUpdateOperationsInput | string
    industryLargeCategory?: NullableStringFieldUpdateOperationsInput | string | null
    industryMediumCategory?: NullableStringFieldUpdateOperationsInput | string | null
    mainProduct?: NullableStringFieldUpdateOperationsInput | string | null
    businessStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FranchiseBrandsCreateManyInput = {
    id?: number
    businessYear: string
    brandId: string
    headquartersId?: string | null
    businessRegistrationNumber?: string | null
    corporateRegistrationNumber?: string | null
    representativeName?: string | null
    brandName: string
    industryLargeCategory?: string | null
    industryMediumCategory?: string | null
    mainProduct?: string | null
    businessStartDate?: Date | string | null
    companyName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FranchiseBrandsUpdateManyMutationInput = {
    businessYear?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    headquartersId?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    corporateRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    representativeName?: NullableStringFieldUpdateOperationsInput | string | null
    brandName?: StringFieldUpdateOperationsInput | string
    industryLargeCategory?: NullableStringFieldUpdateOperationsInput | string | null
    industryMediumCategory?: NullableStringFieldUpdateOperationsInput | string | null
    mainProduct?: NullableStringFieldUpdateOperationsInput | string | null
    businessStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FranchiseBrandsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessYear?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    headquartersId?: NullableStringFieldUpdateOperationsInput | string | null
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    corporateRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    representativeName?: NullableStringFieldUpdateOperationsInput | string | null
    brandName?: StringFieldUpdateOperationsInput | string
    industryLargeCategory?: NullableStringFieldUpdateOperationsInput | string | null
    industryMediumCategory?: NullableStringFieldUpdateOperationsInput | string | null
    mainProduct?: NullableStringFieldUpdateOperationsInput | string | null
    businessStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NationalPensionWorkplacesCreateInput = {
    dataYearMonth: string
    workplaceName: string
    businessRegistrationNumber: string
    workplaceStatusCode: number
    postalCode?: string | null
    addressJibun?: string | null
    addressRoad?: string | null
    legalDongCode?: string | null
    adminDongCode?: string | null
    sidoCode?: string | null
    sigunguCode?: string | null
    eubmyeondongCode?: string | null
    workplaceTypeCode?: number | null
    industryCode?: string | null
    industryName?: string | null
    applicationDate?: string | null
    reRegistrationDate?: string | null
    withdrawalDate?: string | null
    memberCount?: number | null
    monthlyNoticeAmount?: bigint | number | null
    newAcquisitionCount?: number | null
    lossCount?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NationalPensionWorkplacesUncheckedCreateInput = {
    id?: number
    dataYearMonth: string
    workplaceName: string
    businessRegistrationNumber: string
    workplaceStatusCode: number
    postalCode?: string | null
    addressJibun?: string | null
    addressRoad?: string | null
    legalDongCode?: string | null
    adminDongCode?: string | null
    sidoCode?: string | null
    sigunguCode?: string | null
    eubmyeondongCode?: string | null
    workplaceTypeCode?: number | null
    industryCode?: string | null
    industryName?: string | null
    applicationDate?: string | null
    reRegistrationDate?: string | null
    withdrawalDate?: string | null
    memberCount?: number | null
    monthlyNoticeAmount?: bigint | number | null
    newAcquisitionCount?: number | null
    lossCount?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NationalPensionWorkplacesUpdateInput = {
    dataYearMonth?: StringFieldUpdateOperationsInput | string
    workplaceName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: StringFieldUpdateOperationsInput | string
    workplaceStatusCode?: IntFieldUpdateOperationsInput | number
    postalCode?: NullableStringFieldUpdateOperationsInput | string | null
    addressJibun?: NullableStringFieldUpdateOperationsInput | string | null
    addressRoad?: NullableStringFieldUpdateOperationsInput | string | null
    legalDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    adminDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    sidoCode?: NullableStringFieldUpdateOperationsInput | string | null
    sigunguCode?: NullableStringFieldUpdateOperationsInput | string | null
    eubmyeondongCode?: NullableStringFieldUpdateOperationsInput | string | null
    workplaceTypeCode?: NullableIntFieldUpdateOperationsInput | number | null
    industryCode?: NullableStringFieldUpdateOperationsInput | string | null
    industryName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationDate?: NullableStringFieldUpdateOperationsInput | string | null
    reRegistrationDate?: NullableStringFieldUpdateOperationsInput | string | null
    withdrawalDate?: NullableStringFieldUpdateOperationsInput | string | null
    memberCount?: NullableIntFieldUpdateOperationsInput | number | null
    monthlyNoticeAmount?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    newAcquisitionCount?: NullableIntFieldUpdateOperationsInput | number | null
    lossCount?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NationalPensionWorkplacesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataYearMonth?: StringFieldUpdateOperationsInput | string
    workplaceName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: StringFieldUpdateOperationsInput | string
    workplaceStatusCode?: IntFieldUpdateOperationsInput | number
    postalCode?: NullableStringFieldUpdateOperationsInput | string | null
    addressJibun?: NullableStringFieldUpdateOperationsInput | string | null
    addressRoad?: NullableStringFieldUpdateOperationsInput | string | null
    legalDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    adminDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    sidoCode?: NullableStringFieldUpdateOperationsInput | string | null
    sigunguCode?: NullableStringFieldUpdateOperationsInput | string | null
    eubmyeondongCode?: NullableStringFieldUpdateOperationsInput | string | null
    workplaceTypeCode?: NullableIntFieldUpdateOperationsInput | number | null
    industryCode?: NullableStringFieldUpdateOperationsInput | string | null
    industryName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationDate?: NullableStringFieldUpdateOperationsInput | string | null
    reRegistrationDate?: NullableStringFieldUpdateOperationsInput | string | null
    withdrawalDate?: NullableStringFieldUpdateOperationsInput | string | null
    memberCount?: NullableIntFieldUpdateOperationsInput | number | null
    monthlyNoticeAmount?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    newAcquisitionCount?: NullableIntFieldUpdateOperationsInput | number | null
    lossCount?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NationalPensionWorkplacesCreateManyInput = {
    id?: number
    dataYearMonth: string
    workplaceName: string
    businessRegistrationNumber: string
    workplaceStatusCode: number
    postalCode?: string | null
    addressJibun?: string | null
    addressRoad?: string | null
    legalDongCode?: string | null
    adminDongCode?: string | null
    sidoCode?: string | null
    sigunguCode?: string | null
    eubmyeondongCode?: string | null
    workplaceTypeCode?: number | null
    industryCode?: string | null
    industryName?: string | null
    applicationDate?: string | null
    reRegistrationDate?: string | null
    withdrawalDate?: string | null
    memberCount?: number | null
    monthlyNoticeAmount?: bigint | number | null
    newAcquisitionCount?: number | null
    lossCount?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NationalPensionWorkplacesUpdateManyMutationInput = {
    dataYearMonth?: StringFieldUpdateOperationsInput | string
    workplaceName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: StringFieldUpdateOperationsInput | string
    workplaceStatusCode?: IntFieldUpdateOperationsInput | number
    postalCode?: NullableStringFieldUpdateOperationsInput | string | null
    addressJibun?: NullableStringFieldUpdateOperationsInput | string | null
    addressRoad?: NullableStringFieldUpdateOperationsInput | string | null
    legalDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    adminDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    sidoCode?: NullableStringFieldUpdateOperationsInput | string | null
    sigunguCode?: NullableStringFieldUpdateOperationsInput | string | null
    eubmyeondongCode?: NullableStringFieldUpdateOperationsInput | string | null
    workplaceTypeCode?: NullableIntFieldUpdateOperationsInput | number | null
    industryCode?: NullableStringFieldUpdateOperationsInput | string | null
    industryName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationDate?: NullableStringFieldUpdateOperationsInput | string | null
    reRegistrationDate?: NullableStringFieldUpdateOperationsInput | string | null
    withdrawalDate?: NullableStringFieldUpdateOperationsInput | string | null
    memberCount?: NullableIntFieldUpdateOperationsInput | number | null
    monthlyNoticeAmount?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    newAcquisitionCount?: NullableIntFieldUpdateOperationsInput | number | null
    lossCount?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NationalPensionWorkplacesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataYearMonth?: StringFieldUpdateOperationsInput | string
    workplaceName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: StringFieldUpdateOperationsInput | string
    workplaceStatusCode?: IntFieldUpdateOperationsInput | number
    postalCode?: NullableStringFieldUpdateOperationsInput | string | null
    addressJibun?: NullableStringFieldUpdateOperationsInput | string | null
    addressRoad?: NullableStringFieldUpdateOperationsInput | string | null
    legalDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    adminDongCode?: NullableStringFieldUpdateOperationsInput | string | null
    sidoCode?: NullableStringFieldUpdateOperationsInput | string | null
    sigunguCode?: NullableStringFieldUpdateOperationsInput | string | null
    eubmyeondongCode?: NullableStringFieldUpdateOperationsInput | string | null
    workplaceTypeCode?: NullableIntFieldUpdateOperationsInput | number | null
    industryCode?: NullableStringFieldUpdateOperationsInput | string | null
    industryName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationDate?: NullableStringFieldUpdateOperationsInput | string | null
    reRegistrationDate?: NullableStringFieldUpdateOperationsInput | string | null
    withdrawalDate?: NullableStringFieldUpdateOperationsInput | string | null
    memberCount?: NullableIntFieldUpdateOperationsInput | number | null
    monthlyNoticeAmount?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    newAcquisitionCount?: NullableIntFieldUpdateOperationsInput | number | null
    lossCount?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumTaxpayerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TaxpayerType | EnumTaxpayerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaxpayerTypeFilter<$PrismaModel> | $Enums.TaxpayerType
  }

  export type RuleCandidateListRelationFilter = {
    every?: RuleCandidateWhereInput
    some?: RuleCandidateWhereInput
    none?: RuleCandidateWhereInput
  }

  export type RuleListRelationFilter = {
    every?: RuleWhereInput
    some?: RuleWhereInput
    none?: RuleWhereInput
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RuleCandidateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompanyCountOrderByAggregateInput = {
    id?: SortOrder
    companyName?: SortOrder
    businessRegistrationNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taxpayerType?: SortOrder
  }

  export type CompanyMaxOrderByAggregateInput = {
    id?: SortOrder
    companyName?: SortOrder
    businessRegistrationNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taxpayerType?: SortOrder
  }

  export type CompanyMinOrderByAggregateInput = {
    id?: SortOrder
    companyName?: SortOrder
    businessRegistrationNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taxpayerType?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumTaxpayerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaxpayerType | EnumTaxpayerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaxpayerTypeWithAggregatesFilter<$PrismaModel> | $Enums.TaxpayerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaxpayerTypeFilter<$PrismaModel>
    _max?: NestedEnumTaxpayerTypeFilter<$PrismaModel>
  }

  export type TransactionCacheCountOrderByAggregateInput = {
    rawTextHash?: SortOrder
    rawText?: SortOrder
    uniqueKey?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionCacheMaxOrderByAggregateInput = {
    rawTextHash?: SortOrder
    rawText?: SortOrder
    uniqueKey?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionCacheMinOrderByAggregateInput = {
    rawTextHash?: SortOrder
    rawText?: SortOrder
    uniqueKey?: SortOrder
    createdAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumRuleCreatorFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleCreator | EnumRuleCreatorFieldRefInput<$PrismaModel>
    in?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    notIn?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    not?: NestedEnumRuleCreatorFilter<$PrismaModel> | $Enums.RuleCreator
  }

  export type CompanyScalarRelationFilter = {
    is?: CompanyWhereInput
    isNot?: CompanyWhereInput
  }

  export type RuleCompanyIdUniqueKeyCompoundUniqueInput = {
    companyId: string
    uniqueKey: string
  }

  export type RuleCountOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetCreditAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RuleAvgOrderByAggregateInput = {
    id?: SortOrder
    priority?: SortOrder
  }

  export type RuleMaxOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetCreditAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RuleMinOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetCreditAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RuleSumOrderByAggregateInput = {
    id?: SortOrder
    priority?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumRuleCreatorWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleCreator | EnumRuleCreatorFieldRefInput<$PrismaModel>
    in?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    notIn?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    not?: NestedEnumRuleCreatorWithAggregatesFilter<$PrismaModel> | $Enums.RuleCreator
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRuleCreatorFilter<$PrismaModel>
    _max?: NestedEnumRuleCreatorFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type RuleCandidateCompanyIdUniqueKeyTargetDebitAccountCompoundUniqueInput = {
    companyId: string
    uniqueKey: string
    targetDebitAccount: string
  }

  export type RuleCandidateCountOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    suggestionCount?: SortOrder
    lastSuggestedAt?: SortOrder
  }

  export type RuleCandidateAvgOrderByAggregateInput = {
    id?: SortOrder
    suggestionCount?: SortOrder
  }

  export type RuleCandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    suggestionCount?: SortOrder
    lastSuggestedAt?: SortOrder
  }

  export type RuleCandidateMinOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    uniqueKey?: SortOrder
    targetDebitAccount?: SortOrder
    targetSuggestedTag?: SortOrder
    vatApplicable?: SortOrder
    suggestionCount?: SortOrder
    lastSuggestedAt?: SortOrder
  }

  export type RuleCandidateSumOrderByAggregateInput = {
    id?: SortOrder
    suggestionCount?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumTransactionIOTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionIOType | EnumTransactionIOTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionIOTypeFilter<$PrismaModel> | $Enums.TransactionIOType
  }

  export type EnumTransactionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionStatus | EnumTransactionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionStatusFilter<$PrismaModel> | $Enums.TransactionStatus
  }

  export type EnumProcessorTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessorType | EnumProcessorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumProcessorTypeNullableFilter<$PrismaModel> | $Enums.ProcessorType | null
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    rawText?: SortOrder
    transactionDate?: SortOrder
    amount?: SortOrder
    normalizedUniqueKey?: SortOrder
    isAnomaly?: SortOrder
    anomalyScore?: SortOrder
    llmResponse?: SortOrder
    userClarification?: SortOrder
    finalDebitAccount?: SortOrder
    finalCreditAccount?: SortOrder
    finalSuggestedTag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionType?: SortOrder
    status?: SortOrder
    processedBy?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    anomalyScore?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    rawText?: SortOrder
    transactionDate?: SortOrder
    amount?: SortOrder
    normalizedUniqueKey?: SortOrder
    isAnomaly?: SortOrder
    anomalyScore?: SortOrder
    finalDebitAccount?: SortOrder
    finalCreditAccount?: SortOrder
    finalSuggestedTag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionType?: SortOrder
    status?: SortOrder
    processedBy?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    rawText?: SortOrder
    transactionDate?: SortOrder
    amount?: SortOrder
    normalizedUniqueKey?: SortOrder
    isAnomaly?: SortOrder
    anomalyScore?: SortOrder
    finalDebitAccount?: SortOrder
    finalCreditAccount?: SortOrder
    finalSuggestedTag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionType?: SortOrder
    status?: SortOrder
    processedBy?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    anomalyScore?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumTransactionIOTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionIOType | EnumTransactionIOTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionIOTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionIOType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionIOTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionIOTypeFilter<$PrismaModel>
  }

  export type EnumTransactionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionStatus | EnumTransactionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionStatusWithAggregatesFilter<$PrismaModel> | $Enums.TransactionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionStatusFilter<$PrismaModel>
    _max?: NestedEnumTransactionStatusFilter<$PrismaModel>
  }

  export type EnumProcessorTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessorType | EnumProcessorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumProcessorTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ProcessorType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumProcessorTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumProcessorTypeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DatacollectionGyeonggiDeliveryCountOrderByAggregateInput = {
    id?: SortOrder
    listTotalCount?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    apiVersion?: SortOrder
    businessRegNo?: SortOrder
    sigunName?: SortOrder
    storeName?: SortOrder
    industryType?: SortOrder
    refinedRoadAddress?: SortOrder
    refinedLotAddress?: SortOrder
    refinedZipcode?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatacollectionGyeonggiDeliveryAvgOrderByAggregateInput = {
    listTotalCount?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
  }

  export type DatacollectionGyeonggiDeliveryMaxOrderByAggregateInput = {
    id?: SortOrder
    listTotalCount?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    apiVersion?: SortOrder
    businessRegNo?: SortOrder
    sigunName?: SortOrder
    storeName?: SortOrder
    industryType?: SortOrder
    refinedRoadAddress?: SortOrder
    refinedLotAddress?: SortOrder
    refinedZipcode?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatacollectionGyeonggiDeliveryMinOrderByAggregateInput = {
    id?: SortOrder
    listTotalCount?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    apiVersion?: SortOrder
    businessRegNo?: SortOrder
    sigunName?: SortOrder
    storeName?: SortOrder
    industryType?: SortOrder
    refinedRoadAddress?: SortOrder
    refinedLotAddress?: SortOrder
    refinedZipcode?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatacollectionGyeonggiDeliverySumOrderByAggregateInput = {
    listTotalCount?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DatacollectionSeoulRestaurantsCountOrderByAggregateInput = {
    id?: SortOrder
    licenseDate?: SortOrder
    businessStatusCode?: SortOrder
    businessStatusName?: SortOrder
    businessName?: SortOrder
    businessType?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiVersion?: SortOrder
    businessRegistrationNumber?: SortOrder
    licenseExpiryDate?: SortOrder
    listTotalCount?: SortOrder
    lotNumberAddress?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    roadNameAddress?: SortOrder
    zipCode?: SortOrder
  }

  export type DatacollectionSeoulRestaurantsAvgOrderByAggregateInput = {
    listTotalCount?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
  }

  export type DatacollectionSeoulRestaurantsMaxOrderByAggregateInput = {
    id?: SortOrder
    licenseDate?: SortOrder
    businessStatusCode?: SortOrder
    businessStatusName?: SortOrder
    businessName?: SortOrder
    businessType?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiVersion?: SortOrder
    businessRegistrationNumber?: SortOrder
    licenseExpiryDate?: SortOrder
    listTotalCount?: SortOrder
    lotNumberAddress?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    roadNameAddress?: SortOrder
    zipCode?: SortOrder
  }

  export type DatacollectionSeoulRestaurantsMinOrderByAggregateInput = {
    id?: SortOrder
    licenseDate?: SortOrder
    businessStatusCode?: SortOrder
    businessStatusName?: SortOrder
    businessName?: SortOrder
    businessType?: SortOrder
    dataSource?: SortOrder
    collectionBatchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiVersion?: SortOrder
    businessRegistrationNumber?: SortOrder
    licenseExpiryDate?: SortOrder
    listTotalCount?: SortOrder
    lotNumberAddress?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
    responseCode?: SortOrder
    responseMessage?: SortOrder
    roadNameAddress?: SortOrder
    zipCode?: SortOrder
  }

  export type DatacollectionSeoulRestaurantsSumOrderByAggregateInput = {
    listTotalCount?: SortOrder
    refinedLatitude?: SortOrder
    refinedLongitude?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type RuleEngineCountOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    confidence?: SortOrder
    question?: SortOrder
    primaryTag?: SortOrder
    primaryAccount?: SortOrder
    secondaryTag?: SortOrder
    secondaryAccount?: SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
    lastUsed?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RuleEngineAvgOrderByAggregateInput = {
    confidence?: SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
  }

  export type RuleEngineMaxOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    confidence?: SortOrder
    question?: SortOrder
    primaryTag?: SortOrder
    primaryAccount?: SortOrder
    secondaryTag?: SortOrder
    secondaryAccount?: SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
    lastUsed?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RuleEngineMinOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    confidence?: SortOrder
    question?: SortOrder
    primaryTag?: SortOrder
    primaryAccount?: SortOrder
    secondaryTag?: SortOrder
    secondaryAccount?: SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
    lastUsed?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RuleEngineSumOrderByAggregateInput = {
    confidence?: SortOrder
    usageCount?: SortOrder
    positiveCount?: SortOrder
    negativeCount?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type RuleEngineCandidateKeywordTagAccountCompoundUniqueInput = {
    keyword: string
    tag: string
    account: string
  }

  export type RuleEngineCandidateCountOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    tag?: SortOrder
    account?: SortOrder
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
    firstSuggested?: SortOrder
    lastSuggested?: SortOrder
    isApproved?: SortOrder
    approvedAt?: SortOrder
    approvedBy?: SortOrder
  }

  export type RuleEngineCandidateAvgOrderByAggregateInput = {
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
  }

  export type RuleEngineCandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    tag?: SortOrder
    account?: SortOrder
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
    firstSuggested?: SortOrder
    lastSuggested?: SortOrder
    isApproved?: SortOrder
    approvedAt?: SortOrder
    approvedBy?: SortOrder
  }

  export type RuleEngineCandidateMinOrderByAggregateInput = {
    id?: SortOrder
    keyword?: SortOrder
    tag?: SortOrder
    account?: SortOrder
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
    firstSuggested?: SortOrder
    lastSuggested?: SortOrder
    isApproved?: SortOrder
    approvedAt?: SortOrder
    approvedBy?: SortOrder
  }

  export type RuleEngineCandidateSumOrderByAggregateInput = {
    suggestionCount?: SortOrder
    approvalThreshold?: SortOrder
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type RuleEngineFeedbackCountOrderByAggregateInput = {
    id?: SortOrder
    ruleId?: SortOrder
    transactionText?: SortOrder
    normalizedText?: SortOrder
    selectedOption?: SortOrder
    selectedTag?: SortOrder
    selectedAccount?: SortOrder
    feedbackType?: SortOrder
    createdAt?: SortOrder
  }

  export type RuleEngineFeedbackAvgOrderByAggregateInput = {
    selectedOption?: SortOrder
  }

  export type RuleEngineFeedbackMaxOrderByAggregateInput = {
    id?: SortOrder
    ruleId?: SortOrder
    transactionText?: SortOrder
    normalizedText?: SortOrder
    selectedOption?: SortOrder
    selectedTag?: SortOrder
    selectedAccount?: SortOrder
    feedbackType?: SortOrder
    createdAt?: SortOrder
  }

  export type RuleEngineFeedbackMinOrderByAggregateInput = {
    id?: SortOrder
    ruleId?: SortOrder
    transactionText?: SortOrder
    normalizedText?: SortOrder
    selectedOption?: SortOrder
    selectedTag?: SortOrder
    selectedAccount?: SortOrder
    feedbackType?: SortOrder
    createdAt?: SortOrder
  }

  export type RuleEngineFeedbackSumOrderByAggregateInput = {
    selectedOption?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FranchiseBrandsBrandIdBusinessYearCompoundUniqueInput = {
    brandId: string
    businessYear: string
  }

  export type FranchiseBrandsCountOrderByAggregateInput = {
    id?: SortOrder
    businessYear?: SortOrder
    brandId?: SortOrder
    headquartersId?: SortOrder
    businessRegistrationNumber?: SortOrder
    corporateRegistrationNumber?: SortOrder
    representativeName?: SortOrder
    brandName?: SortOrder
    industryLargeCategory?: SortOrder
    industryMediumCategory?: SortOrder
    mainProduct?: SortOrder
    businessStartDate?: SortOrder
    companyName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FranchiseBrandsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type FranchiseBrandsMaxOrderByAggregateInput = {
    id?: SortOrder
    businessYear?: SortOrder
    brandId?: SortOrder
    headquartersId?: SortOrder
    businessRegistrationNumber?: SortOrder
    corporateRegistrationNumber?: SortOrder
    representativeName?: SortOrder
    brandName?: SortOrder
    industryLargeCategory?: SortOrder
    industryMediumCategory?: SortOrder
    mainProduct?: SortOrder
    businessStartDate?: SortOrder
    companyName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FranchiseBrandsMinOrderByAggregateInput = {
    id?: SortOrder
    businessYear?: SortOrder
    brandId?: SortOrder
    headquartersId?: SortOrder
    businessRegistrationNumber?: SortOrder
    corporateRegistrationNumber?: SortOrder
    representativeName?: SortOrder
    brandName?: SortOrder
    industryLargeCategory?: SortOrder
    industryMediumCategory?: SortOrder
    mainProduct?: SortOrder
    businessStartDate?: SortOrder
    companyName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FranchiseBrandsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NationalPensionWorkplacesCountOrderByAggregateInput = {
    id?: SortOrder
    dataYearMonth?: SortOrder
    workplaceName?: SortOrder
    businessRegistrationNumber?: SortOrder
    workplaceStatusCode?: SortOrder
    postalCode?: SortOrder
    addressJibun?: SortOrder
    addressRoad?: SortOrder
    legalDongCode?: SortOrder
    adminDongCode?: SortOrder
    sidoCode?: SortOrder
    sigunguCode?: SortOrder
    eubmyeondongCode?: SortOrder
    workplaceTypeCode?: SortOrder
    industryCode?: SortOrder
    industryName?: SortOrder
    applicationDate?: SortOrder
    reRegistrationDate?: SortOrder
    withdrawalDate?: SortOrder
    memberCount?: SortOrder
    monthlyNoticeAmount?: SortOrder
    newAcquisitionCount?: SortOrder
    lossCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NationalPensionWorkplacesAvgOrderByAggregateInput = {
    id?: SortOrder
    workplaceStatusCode?: SortOrder
    workplaceTypeCode?: SortOrder
    memberCount?: SortOrder
    monthlyNoticeAmount?: SortOrder
    newAcquisitionCount?: SortOrder
    lossCount?: SortOrder
  }

  export type NationalPensionWorkplacesMaxOrderByAggregateInput = {
    id?: SortOrder
    dataYearMonth?: SortOrder
    workplaceName?: SortOrder
    businessRegistrationNumber?: SortOrder
    workplaceStatusCode?: SortOrder
    postalCode?: SortOrder
    addressJibun?: SortOrder
    addressRoad?: SortOrder
    legalDongCode?: SortOrder
    adminDongCode?: SortOrder
    sidoCode?: SortOrder
    sigunguCode?: SortOrder
    eubmyeondongCode?: SortOrder
    workplaceTypeCode?: SortOrder
    industryCode?: SortOrder
    industryName?: SortOrder
    applicationDate?: SortOrder
    reRegistrationDate?: SortOrder
    withdrawalDate?: SortOrder
    memberCount?: SortOrder
    monthlyNoticeAmount?: SortOrder
    newAcquisitionCount?: SortOrder
    lossCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NationalPensionWorkplacesMinOrderByAggregateInput = {
    id?: SortOrder
    dataYearMonth?: SortOrder
    workplaceName?: SortOrder
    businessRegistrationNumber?: SortOrder
    workplaceStatusCode?: SortOrder
    postalCode?: SortOrder
    addressJibun?: SortOrder
    addressRoad?: SortOrder
    legalDongCode?: SortOrder
    adminDongCode?: SortOrder
    sidoCode?: SortOrder
    sigunguCode?: SortOrder
    eubmyeondongCode?: SortOrder
    workplaceTypeCode?: SortOrder
    industryCode?: SortOrder
    industryName?: SortOrder
    applicationDate?: SortOrder
    reRegistrationDate?: SortOrder
    withdrawalDate?: SortOrder
    memberCount?: SortOrder
    monthlyNoticeAmount?: SortOrder
    newAcquisitionCount?: SortOrder
    lossCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NationalPensionWorkplacesSumOrderByAggregateInput = {
    id?: SortOrder
    workplaceStatusCode?: SortOrder
    workplaceTypeCode?: SortOrder
    memberCount?: SortOrder
    monthlyNoticeAmount?: SortOrder
    newAcquisitionCount?: SortOrder
    lossCount?: SortOrder
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type RuleCandidateCreateNestedManyWithoutCompanyInput = {
    create?: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput> | RuleCandidateCreateWithoutCompanyInput[] | RuleCandidateUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCandidateCreateOrConnectWithoutCompanyInput | RuleCandidateCreateOrConnectWithoutCompanyInput[]
    createMany?: RuleCandidateCreateManyCompanyInputEnvelope
    connect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
  }

  export type RuleCreateNestedManyWithoutCompanyInput = {
    create?: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput> | RuleCreateWithoutCompanyInput[] | RuleUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCreateOrConnectWithoutCompanyInput | RuleCreateOrConnectWithoutCompanyInput[]
    createMany?: RuleCreateManyCompanyInputEnvelope
    connect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
  }

  export type TransactionCreateNestedManyWithoutCompanyInput = {
    create?: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput> | TransactionCreateWithoutCompanyInput[] | TransactionUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCompanyInput | TransactionCreateOrConnectWithoutCompanyInput[]
    createMany?: TransactionCreateManyCompanyInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type RuleCandidateUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput> | RuleCandidateCreateWithoutCompanyInput[] | RuleCandidateUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCandidateCreateOrConnectWithoutCompanyInput | RuleCandidateCreateOrConnectWithoutCompanyInput[]
    createMany?: RuleCandidateCreateManyCompanyInputEnvelope
    connect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
  }

  export type RuleUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput> | RuleCreateWithoutCompanyInput[] | RuleUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCreateOrConnectWithoutCompanyInput | RuleCreateOrConnectWithoutCompanyInput[]
    createMany?: RuleCreateManyCompanyInputEnvelope
    connect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput> | TransactionCreateWithoutCompanyInput[] | TransactionUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCompanyInput | TransactionCreateOrConnectWithoutCompanyInput[]
    createMany?: TransactionCreateManyCompanyInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumTaxpayerTypeFieldUpdateOperationsInput = {
    set?: $Enums.TaxpayerType
  }

  export type RuleCandidateUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput> | RuleCandidateCreateWithoutCompanyInput[] | RuleCandidateUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCandidateCreateOrConnectWithoutCompanyInput | RuleCandidateCreateOrConnectWithoutCompanyInput[]
    upsert?: RuleCandidateUpsertWithWhereUniqueWithoutCompanyInput | RuleCandidateUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: RuleCandidateCreateManyCompanyInputEnvelope
    set?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    disconnect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    delete?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    connect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    update?: RuleCandidateUpdateWithWhereUniqueWithoutCompanyInput | RuleCandidateUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: RuleCandidateUpdateManyWithWhereWithoutCompanyInput | RuleCandidateUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: RuleCandidateScalarWhereInput | RuleCandidateScalarWhereInput[]
  }

  export type RuleUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput> | RuleCreateWithoutCompanyInput[] | RuleUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCreateOrConnectWithoutCompanyInput | RuleCreateOrConnectWithoutCompanyInput[]
    upsert?: RuleUpsertWithWhereUniqueWithoutCompanyInput | RuleUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: RuleCreateManyCompanyInputEnvelope
    set?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    disconnect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    delete?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    connect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    update?: RuleUpdateWithWhereUniqueWithoutCompanyInput | RuleUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: RuleUpdateManyWithWhereWithoutCompanyInput | RuleUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: RuleScalarWhereInput | RuleScalarWhereInput[]
  }

  export type TransactionUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput> | TransactionCreateWithoutCompanyInput[] | TransactionUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCompanyInput | TransactionCreateOrConnectWithoutCompanyInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutCompanyInput | TransactionUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: TransactionCreateManyCompanyInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutCompanyInput | TransactionUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutCompanyInput | TransactionUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type RuleCandidateUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput> | RuleCandidateCreateWithoutCompanyInput[] | RuleCandidateUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCandidateCreateOrConnectWithoutCompanyInput | RuleCandidateCreateOrConnectWithoutCompanyInput[]
    upsert?: RuleCandidateUpsertWithWhereUniqueWithoutCompanyInput | RuleCandidateUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: RuleCandidateCreateManyCompanyInputEnvelope
    set?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    disconnect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    delete?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    connect?: RuleCandidateWhereUniqueInput | RuleCandidateWhereUniqueInput[]
    update?: RuleCandidateUpdateWithWhereUniqueWithoutCompanyInput | RuleCandidateUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: RuleCandidateUpdateManyWithWhereWithoutCompanyInput | RuleCandidateUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: RuleCandidateScalarWhereInput | RuleCandidateScalarWhereInput[]
  }

  export type RuleUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput> | RuleCreateWithoutCompanyInput[] | RuleUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: RuleCreateOrConnectWithoutCompanyInput | RuleCreateOrConnectWithoutCompanyInput[]
    upsert?: RuleUpsertWithWhereUniqueWithoutCompanyInput | RuleUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: RuleCreateManyCompanyInputEnvelope
    set?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    disconnect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    delete?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    connect?: RuleWhereUniqueInput | RuleWhereUniqueInput[]
    update?: RuleUpdateWithWhereUniqueWithoutCompanyInput | RuleUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: RuleUpdateManyWithWhereWithoutCompanyInput | RuleUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: RuleScalarWhereInput | RuleScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput> | TransactionCreateWithoutCompanyInput[] | TransactionUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCompanyInput | TransactionCreateOrConnectWithoutCompanyInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutCompanyInput | TransactionUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: TransactionCreateManyCompanyInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutCompanyInput | TransactionUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutCompanyInput | TransactionUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type CompanyCreateNestedOneWithoutRulesInput = {
    create?: XOR<CompanyCreateWithoutRulesInput, CompanyUncheckedCreateWithoutRulesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutRulesInput
    connect?: CompanyWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumRuleCreatorFieldUpdateOperationsInput = {
    set?: $Enums.RuleCreator
  }

  export type CompanyUpdateOneRequiredWithoutRulesNestedInput = {
    create?: XOR<CompanyCreateWithoutRulesInput, CompanyUncheckedCreateWithoutRulesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutRulesInput
    upsert?: CompanyUpsertWithoutRulesInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutRulesInput, CompanyUpdateWithoutRulesInput>, CompanyUncheckedUpdateWithoutRulesInput>
  }

  export type CompanyCreateNestedOneWithoutRuleCandidatesInput = {
    create?: XOR<CompanyCreateWithoutRuleCandidatesInput, CompanyUncheckedCreateWithoutRuleCandidatesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutRuleCandidatesInput
    connect?: CompanyWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type CompanyUpdateOneRequiredWithoutRuleCandidatesNestedInput = {
    create?: XOR<CompanyCreateWithoutRuleCandidatesInput, CompanyUncheckedCreateWithoutRuleCandidatesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutRuleCandidatesInput
    upsert?: CompanyUpsertWithoutRuleCandidatesInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutRuleCandidatesInput, CompanyUpdateWithoutRuleCandidatesInput>, CompanyUncheckedUpdateWithoutRuleCandidatesInput>
  }

  export type CompanyCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<CompanyCreateWithoutTransactionsInput, CompanyUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutTransactionsInput
    connect?: CompanyWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumTransactionIOTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionIOType
  }

  export type EnumTransactionStatusFieldUpdateOperationsInput = {
    set?: $Enums.TransactionStatus
  }

  export type NullableEnumProcessorTypeFieldUpdateOperationsInput = {
    set?: $Enums.ProcessorType | null
  }

  export type CompanyUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<CompanyCreateWithoutTransactionsInput, CompanyUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutTransactionsInput
    upsert?: CompanyUpsertWithoutTransactionsInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutTransactionsInput, CompanyUpdateWithoutTransactionsInput>, CompanyUncheckedUpdateWithoutTransactionsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumTaxpayerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TaxpayerType | EnumTaxpayerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaxpayerTypeFilter<$PrismaModel> | $Enums.TaxpayerType
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumTaxpayerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaxpayerType | EnumTaxpayerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaxpayerType[] | ListEnumTaxpayerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaxpayerTypeWithAggregatesFilter<$PrismaModel> | $Enums.TaxpayerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaxpayerTypeFilter<$PrismaModel>
    _max?: NestedEnumTaxpayerTypeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumRuleCreatorFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleCreator | EnumRuleCreatorFieldRefInput<$PrismaModel>
    in?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    notIn?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    not?: NestedEnumRuleCreatorFilter<$PrismaModel> | $Enums.RuleCreator
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumRuleCreatorWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleCreator | EnumRuleCreatorFieldRefInput<$PrismaModel>
    in?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    notIn?: $Enums.RuleCreator[] | ListEnumRuleCreatorFieldRefInput<$PrismaModel>
    not?: NestedEnumRuleCreatorWithAggregatesFilter<$PrismaModel> | $Enums.RuleCreator
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRuleCreatorFilter<$PrismaModel>
    _max?: NestedEnumRuleCreatorFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedEnumTransactionIOTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionIOType | EnumTransactionIOTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionIOTypeFilter<$PrismaModel> | $Enums.TransactionIOType
  }

  export type NestedEnumTransactionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionStatus | EnumTransactionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionStatusFilter<$PrismaModel> | $Enums.TransactionStatus
  }

  export type NestedEnumProcessorTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessorType | EnumProcessorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumProcessorTypeNullableFilter<$PrismaModel> | $Enums.ProcessorType | null
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumTransactionIOTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionIOType | EnumTransactionIOTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionIOType[] | ListEnumTransactionIOTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionIOTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionIOType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionIOTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionIOTypeFilter<$PrismaModel>
  }

  export type NestedEnumTransactionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionStatus | EnumTransactionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionStatus[] | ListEnumTransactionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionStatusWithAggregatesFilter<$PrismaModel> | $Enums.TransactionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionStatusFilter<$PrismaModel>
    _max?: NestedEnumTransactionStatusFilter<$PrismaModel>
  }

  export type NestedEnumProcessorTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessorType | EnumProcessorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ProcessorType[] | ListEnumProcessorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumProcessorTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ProcessorType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumProcessorTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumProcessorTypeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type RuleCandidateCreateWithoutCompanyInput = {
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
  }

  export type RuleCandidateUncheckedCreateWithoutCompanyInput = {
    id?: number
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
  }

  export type RuleCandidateCreateOrConnectWithoutCompanyInput = {
    where: RuleCandidateWhereUniqueInput
    create: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput>
  }

  export type RuleCandidateCreateManyCompanyInputEnvelope = {
    data: RuleCandidateCreateManyCompanyInput | RuleCandidateCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type RuleCreateWithoutCompanyInput = {
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
  }

  export type RuleUncheckedCreateWithoutCompanyInput = {
    id?: number
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
  }

  export type RuleCreateOrConnectWithoutCompanyInput = {
    where: RuleWhereUniqueInput
    create: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput>
  }

  export type RuleCreateManyCompanyInputEnvelope = {
    data: RuleCreateManyCompanyInput | RuleCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type TransactionCreateWithoutCompanyInput = {
    id?: bigint | number
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
  }

  export type TransactionUncheckedCreateWithoutCompanyInput = {
    id?: bigint | number
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
  }

  export type TransactionCreateOrConnectWithoutCompanyInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput>
  }

  export type TransactionCreateManyCompanyInputEnvelope = {
    data: TransactionCreateManyCompanyInput | TransactionCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type RuleCandidateUpsertWithWhereUniqueWithoutCompanyInput = {
    where: RuleCandidateWhereUniqueInput
    update: XOR<RuleCandidateUpdateWithoutCompanyInput, RuleCandidateUncheckedUpdateWithoutCompanyInput>
    create: XOR<RuleCandidateCreateWithoutCompanyInput, RuleCandidateUncheckedCreateWithoutCompanyInput>
  }

  export type RuleCandidateUpdateWithWhereUniqueWithoutCompanyInput = {
    where: RuleCandidateWhereUniqueInput
    data: XOR<RuleCandidateUpdateWithoutCompanyInput, RuleCandidateUncheckedUpdateWithoutCompanyInput>
  }

  export type RuleCandidateUpdateManyWithWhereWithoutCompanyInput = {
    where: RuleCandidateScalarWhereInput
    data: XOR<RuleCandidateUpdateManyMutationInput, RuleCandidateUncheckedUpdateManyWithoutCompanyInput>
  }

  export type RuleCandidateScalarWhereInput = {
    AND?: RuleCandidateScalarWhereInput | RuleCandidateScalarWhereInput[]
    OR?: RuleCandidateScalarWhereInput[]
    NOT?: RuleCandidateScalarWhereInput | RuleCandidateScalarWhereInput[]
    id?: IntFilter<"RuleCandidate"> | number
    companyId?: UuidFilter<"RuleCandidate"> | string
    uniqueKey?: StringFilter<"RuleCandidate"> | string
    targetDebitAccount?: StringFilter<"RuleCandidate"> | string
    targetSuggestedTag?: StringNullableFilter<"RuleCandidate"> | string | null
    vatApplicable?: BoolNullableFilter<"RuleCandidate"> | boolean | null
    suggestionCount?: IntFilter<"RuleCandidate"> | number
    lastSuggestedAt?: DateTimeFilter<"RuleCandidate"> | Date | string
  }

  export type RuleUpsertWithWhereUniqueWithoutCompanyInput = {
    where: RuleWhereUniqueInput
    update: XOR<RuleUpdateWithoutCompanyInput, RuleUncheckedUpdateWithoutCompanyInput>
    create: XOR<RuleCreateWithoutCompanyInput, RuleUncheckedCreateWithoutCompanyInput>
  }

  export type RuleUpdateWithWhereUniqueWithoutCompanyInput = {
    where: RuleWhereUniqueInput
    data: XOR<RuleUpdateWithoutCompanyInput, RuleUncheckedUpdateWithoutCompanyInput>
  }

  export type RuleUpdateManyWithWhereWithoutCompanyInput = {
    where: RuleScalarWhereInput
    data: XOR<RuleUpdateManyMutationInput, RuleUncheckedUpdateManyWithoutCompanyInput>
  }

  export type RuleScalarWhereInput = {
    AND?: RuleScalarWhereInput | RuleScalarWhereInput[]
    OR?: RuleScalarWhereInput[]
    NOT?: RuleScalarWhereInput | RuleScalarWhereInput[]
    id?: IntFilter<"Rule"> | number
    companyId?: UuidFilter<"Rule"> | string
    uniqueKey?: StringFilter<"Rule"> | string
    targetDebitAccount?: StringFilter<"Rule"> | string
    targetCreditAccount?: StringFilter<"Rule"> | string
    targetSuggestedTag?: StringNullableFilter<"Rule"> | string | null
    vatApplicable?: BoolFilter<"Rule"> | boolean
    priority?: IntFilter<"Rule"> | number
    isActive?: BoolFilter<"Rule"> | boolean
    createdAt?: DateTimeFilter<"Rule"> | Date | string
    createdBy?: EnumRuleCreatorFilter<"Rule"> | $Enums.RuleCreator
  }

  export type TransactionUpsertWithWhereUniqueWithoutCompanyInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutCompanyInput, TransactionUncheckedUpdateWithoutCompanyInput>
    create: XOR<TransactionCreateWithoutCompanyInput, TransactionUncheckedCreateWithoutCompanyInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutCompanyInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutCompanyInput, TransactionUncheckedUpdateWithoutCompanyInput>
  }

  export type TransactionUpdateManyWithWhereWithoutCompanyInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutCompanyInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: BigIntFilter<"Transaction"> | bigint | number
    companyId?: UuidFilter<"Transaction"> | string
    rawText?: StringFilter<"Transaction"> | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    amount?: BigIntFilter<"Transaction"> | bigint | number
    normalizedUniqueKey?: StringNullableFilter<"Transaction"> | string | null
    isAnomaly?: BoolFilter<"Transaction"> | boolean
    anomalyScore?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    llmResponse?: JsonNullableFilter<"Transaction">
    userClarification?: JsonNullableFilter<"Transaction">
    finalDebitAccount?: StringNullableFilter<"Transaction"> | string | null
    finalCreditAccount?: StringNullableFilter<"Transaction"> | string | null
    finalSuggestedTag?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionType?: EnumTransactionIOTypeFilter<"Transaction"> | $Enums.TransactionIOType
    status?: EnumTransactionStatusFilter<"Transaction"> | $Enums.TransactionStatus
    processedBy?: EnumProcessorTypeNullableFilter<"Transaction"> | $Enums.ProcessorType | null
  }

  export type CompanyCreateWithoutRulesInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateCreateNestedManyWithoutCompanyInput
    transactions?: TransactionCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutRulesInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedCreateNestedManyWithoutCompanyInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutRulesInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutRulesInput, CompanyUncheckedCreateWithoutRulesInput>
  }

  export type CompanyUpsertWithoutRulesInput = {
    update: XOR<CompanyUpdateWithoutRulesInput, CompanyUncheckedUpdateWithoutRulesInput>
    create: XOR<CompanyCreateWithoutRulesInput, CompanyUncheckedCreateWithoutRulesInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutRulesInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutRulesInput, CompanyUncheckedUpdateWithoutRulesInput>
  }

  export type CompanyUpdateWithoutRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateWithoutRuleCandidatesInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    rules?: RuleCreateNestedManyWithoutCompanyInput
    transactions?: TransactionCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutRuleCandidatesInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    rules?: RuleUncheckedCreateNestedManyWithoutCompanyInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutRuleCandidatesInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutRuleCandidatesInput, CompanyUncheckedCreateWithoutRuleCandidatesInput>
  }

  export type CompanyUpsertWithoutRuleCandidatesInput = {
    update: XOR<CompanyUpdateWithoutRuleCandidatesInput, CompanyUncheckedUpdateWithoutRuleCandidatesInput>
    create: XOR<CompanyCreateWithoutRuleCandidatesInput, CompanyUncheckedCreateWithoutRuleCandidatesInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutRuleCandidatesInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutRuleCandidatesInput, CompanyUncheckedUpdateWithoutRuleCandidatesInput>
  }

  export type CompanyUpdateWithoutRuleCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    rules?: RuleUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutRuleCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    rules?: RuleUncheckedUpdateManyWithoutCompanyNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateWithoutTransactionsInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateCreateNestedManyWithoutCompanyInput
    rules?: RuleCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutTransactionsInput = {
    id: string
    companyName: string
    businessRegistrationNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    taxpayerType?: $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedCreateNestedManyWithoutCompanyInput
    rules?: RuleUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutTransactionsInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutTransactionsInput, CompanyUncheckedCreateWithoutTransactionsInput>
  }

  export type CompanyUpsertWithoutTransactionsInput = {
    update: XOR<CompanyUpdateWithoutTransactionsInput, CompanyUncheckedUpdateWithoutTransactionsInput>
    create: XOR<CompanyCreateWithoutTransactionsInput, CompanyUncheckedCreateWithoutTransactionsInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutTransactionsInput, CompanyUncheckedUpdateWithoutTransactionsInput>
  }

  export type CompanyUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUpdateManyWithoutCompanyNestedInput
    rules?: RuleUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    businessRegistrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taxpayerType?: EnumTaxpayerTypeFieldUpdateOperationsInput | $Enums.TaxpayerType
    ruleCandidates?: RuleCandidateUncheckedUpdateManyWithoutCompanyNestedInput
    rules?: RuleUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type RuleCandidateCreateManyCompanyInput = {
    id?: number
    uniqueKey: string
    targetDebitAccount: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean | null
    suggestionCount?: number
    lastSuggestedAt?: Date | string
  }

  export type RuleCreateManyCompanyInput = {
    id?: number
    uniqueKey: string
    targetDebitAccount: string
    targetCreditAccount?: string
    targetSuggestedTag?: string | null
    vatApplicable?: boolean
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    createdBy?: $Enums.RuleCreator
  }

  export type TransactionCreateManyCompanyInput = {
    id?: bigint | number
    rawText: string
    transactionDate: Date | string
    amount: bigint | number
    normalizedUniqueKey?: string | null
    isAnomaly?: boolean
    anomalyScore?: Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: string | null
    finalCreditAccount?: string | null
    finalSuggestedTag?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionType: $Enums.TransactionIOType
    status?: $Enums.TransactionStatus
    processedBy?: $Enums.ProcessorType | null
  }

  export type RuleCandidateUpdateWithoutCompanyInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleCandidateUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleCandidateUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    suggestionCount?: IntFieldUpdateOperationsInput | number
    lastSuggestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RuleUpdateWithoutCompanyInput = {
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type RuleUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type RuleUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uniqueKey?: StringFieldUpdateOperationsInput | string
    targetDebitAccount?: StringFieldUpdateOperationsInput | string
    targetCreditAccount?: StringFieldUpdateOperationsInput | string
    targetSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    vatApplicable?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: EnumRuleCreatorFieldUpdateOperationsInput | $Enums.RuleCreator
  }

  export type TransactionUpdateWithoutCompanyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }

  export type TransactionUncheckedUpdateWithoutCompanyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }

  export type TransactionUncheckedUpdateManyWithoutCompanyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    rawText?: StringFieldUpdateOperationsInput | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    amount?: BigIntFieldUpdateOperationsInput | bigint | number
    normalizedUniqueKey?: NullableStringFieldUpdateOperationsInput | string | null
    isAnomaly?: BoolFieldUpdateOperationsInput | boolean
    anomalyScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    llmResponse?: NullableJsonNullValueInput | InputJsonValue
    userClarification?: NullableJsonNullValueInput | InputJsonValue
    finalDebitAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalCreditAccount?: NullableStringFieldUpdateOperationsInput | string | null
    finalSuggestedTag?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionType?: EnumTransactionIOTypeFieldUpdateOperationsInput | $Enums.TransactionIOType
    status?: EnumTransactionStatusFieldUpdateOperationsInput | $Enums.TransactionStatus
    processedBy?: NullableEnumProcessorTypeFieldUpdateOperationsInput | $Enums.ProcessorType | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}