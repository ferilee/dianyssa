import { getRandomValues } from "node:crypto";
import { Readable, Writable } from "node:stream";
import { ReadStream, fstatSync, lstatSync } from "node:fs";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js
var isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-buffer-from/buffer-from.js
var fromArrayBuffer = (input, offset = 0, length = input.byteLength - offset) => {
	if (!isArrayBuffer(input)) throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
	return Buffer.from(input, offset, length);
};
var fromString = (input, encoding) => {
	if (typeof input !== "string") throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
	return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js
var BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
var fromBase64 = (input) => {
	if (input.length * 3 % 4 !== 0) throw new TypeError(`Incorrect padding on base64 string.`);
	if (!BASE64_REGEX.exec(input)) throw new TypeError(`Invalid base64 string.`);
	const buffer = fromString(input, "base64");
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js
var fromUtf8$1 = (input) => {
	const buf = fromString(input, "utf8");
	return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js
var toBase64$1 = (_input) => {
	let input;
	if (typeof _input === "string") input = fromUtf8$1(_input);
	else input = _input;
	if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
	return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("base64");
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/blob/Uint8ArrayBlobAdapter.js
function bindUint8ArrayBlobAdapter(toUtf8, fromUtf8, toBase64, fromBase64) {
	return class Uint8ArrayBlobAdapter extends Uint8Array {
		static fromString(source, encoding = "utf-8") {
			if (typeof source === "string") {
				if (encoding === "base64") return Uint8ArrayBlobAdapter.mutate(fromBase64(source));
				return Uint8ArrayBlobAdapter.mutate(fromUtf8(source));
			}
			throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
		}
		static mutate(source) {
			Object.setPrototypeOf(source, Uint8ArrayBlobAdapter.prototype);
			return source;
		}
		transformToString(encoding = "utf-8") {
			if (encoding === "base64") return toBase64(this);
			return toUtf8(this);
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js
var toUtf8$1 = (input) => {
	if (typeof input === "string") return input;
	if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
	return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/uuid/v4.js
var decimalToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bindV4(getRandomValues) {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return () => crypto.randomUUID();
	return () => {
		const rnds = /* @__PURE__ */ new Uint8Array(16);
		getRandomValues(rnds);
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
	};
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js
var expectNumber = (value) => {
	if (value === null || value === void 0) return;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		if (!Number.isNaN(parsed)) {
			if (String(parsed) !== String(value)) logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
			return parsed;
		}
	}
	if (typeof value === "number") return value;
	throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
};
var MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
var expectFloat32 = (value) => {
	const expected = expectNumber(value);
	if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
		if (Math.abs(expected) > MAX_FLOAT) throw new TypeError(`Expected 32-bit float, got ${value}`);
	}
	return expected;
};
var expectLong = (value) => {
	if (value === null || value === void 0) return;
	if (Number.isInteger(value) && !Number.isNaN(value)) return value;
	throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
};
var expectShort = (value) => expectSizedInt(value, 16);
var expectByte = (value) => expectSizedInt(value, 8);
var expectSizedInt = (value, size) => {
	const expected = expectLong(value);
	if (expected !== void 0 && castInt(expected, size) !== expected) throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
	return expected;
};
var castInt = (value, size) => {
	switch (size) {
		case 32: return Int32Array.of(value)[0];
		case 16: return Int16Array.of(value)[0];
		case 8: return Int8Array.of(value)[0];
	}
};
var strictParseDouble = (value) => {
	if (typeof value == "string") return expectNumber(parseNumber(value));
	return expectNumber(value);
};
var strictParseFloat32 = (value) => {
	if (typeof value == "string") return expectFloat32(parseNumber(value));
	return expectFloat32(value);
};
var NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
var parseNumber = (value) => {
	const matches = value.match(NUMBER_REGEX);
	if (matches === null || matches[0].length !== value.length) throw new TypeError(`Expected real number, got implicit NaN`);
	return parseFloat(value);
};
var strictParseShort = (value) => {
	if (typeof value === "string") return expectShort(parseNumber(value));
	return expectShort(value);
};
var strictParseByte = (value) => {
	if (typeof value === "string") return expectByte(parseNumber(value));
	return expectByte(value);
};
var stackTraceWarning = (message) => {
	return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s) => !s.includes("stackTraceWarning")).join("\n");
};
var logger = { warn: console.warn };
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
var DAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function dateToUtcString(date) {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const dayOfWeek = date.getUTCDay();
	const dayOfMonthInt = date.getUTCDate();
	const hoursInt = date.getUTCHours();
	const minutesInt = date.getUTCMinutes();
	const secondsInt = date.getUTCSeconds();
	const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
	const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
	const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
	const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
	return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
var RFC3339 = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
var parseRfc3339DateTime = (value) => {
	if (value === null || value === void 0) return;
	if (typeof value !== "string") throw new TypeError("RFC-3339 date-times must be expressed as strings");
	const match = RFC3339.exec(value);
	if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
	const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds] = match;
	return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseDateValue(monthStr, "month", 1, 12), parseDateValue(dayStr, "day", 1, 31), {
		hours,
		minutes,
		seconds,
		fractionalMilliseconds
	});
};
var RFC3339_WITH_OFFSET$1 = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}:\d{2})|[zZ])$/);
var parseRfc3339DateTimeWithOffset = (value) => {
	if (value === null || value === void 0) return;
	if (typeof value !== "string") throw new TypeError("RFC-3339 date-times must be expressed as strings");
	const match = RFC3339_WITH_OFFSET$1.exec(value);
	if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
	const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
	const date = buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseDateValue(monthStr, "month", 1, 12), parseDateValue(dayStr, "day", 1, 31), {
		hours,
		minutes,
		seconds,
		fractionalMilliseconds
	});
	if (offsetStr.toUpperCase() != "Z") date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
	return date;
};
var IMF_FIXDATE$1 = /* @__PURE__ */ new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
var RFC_850_DATE$1 = /* @__PURE__ */ new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
var ASC_TIME$1 = /* @__PURE__ */ new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
var parseRfc7231DateTime = (value) => {
	if (value === null || value === void 0) return;
	if (typeof value !== "string") throw new TypeError("RFC-7231 date-times must be expressed as strings");
	let match = IMF_FIXDATE$1.exec(value);
	if (match) {
		const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
		return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
			hours,
			minutes,
			seconds,
			fractionalMilliseconds
		});
	}
	match = RFC_850_DATE$1.exec(value);
	if (match) {
		const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
		return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
			hours,
			minutes,
			seconds,
			fractionalMilliseconds
		}));
	}
	match = ASC_TIME$1.exec(value);
	if (match) {
		const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
		return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), {
			hours,
			minutes,
			seconds,
			fractionalMilliseconds
		});
	}
	throw new TypeError("Invalid RFC-7231 date-time value");
};
var parseEpochTimestamp = (value) => {
	if (value === null || value === void 0) return;
	let valueAsDouble;
	if (typeof value === "number") valueAsDouble = value;
	else if (typeof value === "string") valueAsDouble = strictParseDouble(value);
	else if (typeof value === "object" && value.tag === 1) valueAsDouble = value.value;
	else throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
	if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
	return new Date(Math.round(valueAsDouble * 1e3));
};
var buildDate = (year, month, day, time) => {
	const adjustedMonth = month - 1;
	validateDayOfMonth(year, adjustedMonth, day);
	return new Date(Date.UTC(year, adjustedMonth, day, parseDateValue(time.hours, "hour", 0, 23), parseDateValue(time.minutes, "minute", 0, 59), parseDateValue(time.seconds, "seconds", 0, 60), parseMilliseconds(time.fractionalMilliseconds)));
};
var parseTwoDigitYear = (value) => {
	const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
	const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
	if (valueInThisCentury < thisYear) return valueInThisCentury + 100;
	return valueInThisCentury;
};
var FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1e3;
var adjustRfc850Year = (input) => {
	if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
	return input;
};
var parseMonthByShortName = (value) => {
	const monthIdx = MONTHS.indexOf(value);
	if (monthIdx < 0) throw new TypeError(`Invalid month: ${value}`);
	return monthIdx + 1;
};
var DAYS_IN_MONTH = [
	31,
	28,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
var validateDayOfMonth = (year, month, day) => {
	let maxDays = DAYS_IN_MONTH[month];
	if (month === 1 && isLeapYear(year)) maxDays = 29;
	if (day > maxDays) throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
};
var isLeapYear = (year) => {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
var parseDateValue = (value, type, lower, upper) => {
	const dateVal = strictParseByte(stripLeadingZeroes(value));
	if (dateVal < lower || dateVal > upper) throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
	return dateVal;
};
var parseMilliseconds = (value) => {
	if (value === null || value === void 0) return 0;
	return strictParseFloat32("0." + value) * 1e3;
};
var parseOffsetToMilliseconds = (value) => {
	const directionStr = value[0];
	let direction = 1;
	if (directionStr == "+") direction = 1;
	else if (directionStr == "-") direction = -1;
	else throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
	const hour = Number(value.substring(1, 3));
	const minute = Number(value.substring(4, 6));
	return direction * (hour * 60 + minute) * 60 * 1e3;
};
var stripLeadingZeroes = (value) => {
	let idx = 0;
	while (idx < value.length - 1 && value.charAt(idx) === "0") idx++;
	if (idx === 0) return value;
	return value.slice(idx);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js
var LazyJsonString = function LazyJsonString(val) {
	return Object.assign(new String(val), {
		deserializeJSON() {
			return JSON.parse(String(val));
		},
		toString() {
			return String(val);
		},
		toJSON() {
			return String(val);
		}
	});
};
LazyJsonString.from = (object) => {
	if (object && typeof object === "object" && (object instanceof LazyJsonString || "deserializeJSON" in object)) return object;
	else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) return LazyJsonString(String(object));
	return LazyJsonString(JSON.stringify(object));
};
LazyJsonString.fromObject = LazyJsonString.from;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js
function quoteHeader(part) {
	if (part.includes(",") || part.includes("\"")) part = `"${part.replace(/"/g, "\\\"")}"`;
	return part;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js
var ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
var mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
var time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
var date = `(\\d?\\d)`;
var year = `(\\d{4})`;
var RFC3339_WITH_OFFSET = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
var IMF_FIXDATE = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
var RFC_850_DATE = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
var ASC_TIME = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
var months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var _parseEpochTimestamp = (value) => {
	if (value == null) return;
	let num = NaN;
	if (typeof value === "number") num = value;
	else if (typeof value === "string") {
		if (!/^-?\d*\.?\d+$/.test(value)) throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
		num = Number.parseFloat(value);
	} else if (typeof value === "object" && value.tag === 1) num = value.value;
	if (isNaN(num) || Math.abs(num) === Infinity) throw new TypeError("Epoch timestamps must be valid finite numbers.");
	return new Date(Math.round(num * 1e3));
};
var _parseRfc3339DateTimeWithOffset = (value) => {
	if (value == null) return;
	if (typeof value !== "string") throw new TypeError("RFC3339 timestamps must be strings");
	const matches = RFC3339_WITH_OFFSET.exec(value);
	if (!matches) throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
	const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
	range(monthStr, 1, 12);
	range(dayStr, 1, 31);
	range(hours, 0, 23);
	range(minutes, 0, 59);
	range(seconds, 0, 60);
	const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1e3) : 0));
	date.setUTCFullYear(Number(yearStr));
	if (offsetStr.toUpperCase() != "Z") {
		const [, sign, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [
			void 0,
			"+",
			0,
			0
		];
		const scalar = sign === "-" ? 1 : -1;
		date.setTime(date.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1e3 + Number(offsetM) * 60 * 1e3));
	}
	return date;
};
var _parseRfc7231DateTime = (value) => {
	if (value == null) return;
	if (typeof value !== "string") throw new TypeError("RFC7231 timestamps must be strings.");
	let day;
	let month;
	let year;
	let hour;
	let minute;
	let second;
	let fraction;
	let matches;
	if (matches = IMF_FIXDATE.exec(value)) [, day, month, year, hour, minute, second, fraction] = matches;
	else if (matches = RFC_850_DATE.exec(value)) {
		[, day, month, year, hour, minute, second, fraction] = matches;
		year = (Number(year) + 1900).toString();
	} else if (matches = ASC_TIME.exec(value)) [, month, day, hour, minute, second, fraction, year] = matches;
	if (year && second) {
		const timestamp = Date.UTC(Number(year), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1e3) : 0);
		range(day, 1, 31);
		range(hour, 0, 23);
		range(minute, 0, 59);
		range(second, 0, 60);
		const date = new Date(timestamp);
		date.setUTCFullYear(Number(year));
		return date;
	}
	throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
};
function range(v, min, max) {
	const _v = Number(v);
	if (_v < min || _v > max) throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/split-every.js
function splitEvery(value, delimiter, numDelimiters) {
	if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
	const segments = value.split(delimiter);
	if (numDelimiters === 1) return segments;
	const compoundSegments = [];
	let currentSegment = "";
	for (let i = 0; i < segments.length; i++) {
		if (currentSegment === "") currentSegment = segments[i];
		else currentSegment += delimiter + segments[i];
		if ((i + 1) % numDelimiters === 0) {
			compoundSegments.push(currentSegment);
			currentSegment = "";
		}
	}
	if (currentSegment !== "") compoundSegments.push(currentSegment);
	return compoundSegments;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/split-header.js
var splitHeader = (value) => {
	const z = value.length;
	const values = [];
	let withinQuotes = false;
	let prevChar = void 0;
	let anchor = 0;
	for (let i = 0; i < z; ++i) {
		const char = value[i];
		switch (char) {
			case `"`:
				if (prevChar !== "\\") withinQuotes = !withinQuotes;
				break;
			case ",":
				if (!withinQuotes) {
					values.push(value.slice(anchor, i));
					anchor = i + 1;
				}
				break;
			default:
		}
		prevChar = char;
	}
	values.push(value.slice(anchor));
	return values.map((v) => {
		v = v.trim();
		const z = v.length;
		if (z < 2) return v;
		if (v[0] === `"` && v[z - 1] === `"`) v = v.slice(1, z - 1);
		return v.replace(/\\"/g, "\"");
	});
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js
var format = /^-?\d*(\.\d+)?$/;
var NumericValue = class NumericValue {
	string;
	type;
	constructor(string, type) {
		this.string = string;
		this.type = type;
		if (!format.test(string)) throw new Error(`@smithy/core/serde - NumericValue must only contain [0-9], at most one decimal point ".", and an optional negation prefix "-".`);
	}
	toString() {
		return this.string;
	}
	static [Symbol.hasInstance](object) {
		if (!object || typeof object !== "object") return false;
		const _nv = object;
		return NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js
var SHORT_TO_HEX = {};
var HEX_TO_SHORT = {};
for (let i = 0; i < 256; i++) {
	let encodedByte = i.toString(16).toLowerCase();
	if (encodedByte.length === 1) encodedByte = `0${encodedByte}`;
	SHORT_TO_HEX[i] = encodedByte;
	HEX_TO_SHORT[encodedByte] = i;
}
function fromHex(encoded) {
	if (encoded.length % 2 !== 0) throw new Error("Hex encoded strings must have an even number length");
	const out = new Uint8Array(encoded.length / 2);
	for (let i = 0; i < encoded.length; i += 2) {
		const encodedByte = encoded.slice(i, i + 2).toLowerCase();
		if (encodedByte in HEX_TO_SHORT) out[i / 2] = HEX_TO_SHORT[encodedByte];
		else throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
	}
	return out;
}
function toHex(bytes) {
	let out = "";
	for (let i = 0; i < bytes.byteLength; i++) out += SHORT_TO_HEX[bytes[i]];
	return out;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.js
var calculateBodyLength = (body) => {
	if (!body) return 0;
	if (typeof body === "string") return Buffer.byteLength(body);
	else if (typeof body.byteLength === "number") return body.byteLength;
	else if (typeof body.size === "number") return body.size;
	else if (typeof body.start === "number" && typeof body.end === "number") return body.end + 1 - body.start;
	else if (body instanceof ReadStream) {
		if (body.path != null) return lstatSync(body.path).size;
		else if (typeof body.fd === "number") return fstatSync(body.fd).size;
	}
	throw new Error(`Body Length computation failed for ${body}`);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUint8Array.js
var toUint8Array = (data) => {
	if (data instanceof Uint8Array) return data;
	if (typeof data === "string") return fromUtf8$1(data);
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
	return new Uint8Array(data);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js
function concatBytes(arrays, length) {
	if (length === void 0) {
		length = 0;
		for (const bytes of arrays) length += bytes.byteLength;
	}
	const result = new Uint8Array(length);
	let offset = 0;
	for (const buf of arrays) {
		result.set(buf, offset);
		offset += buf.byteLength;
	}
	return result;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/ChecksumStream.js
var ChecksumStream$1 = class extends Readable {
	expectedChecksum;
	checksumSourceLocation;
	checksum;
	source;
	base64Encoder;
	constructor({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) {
		super();
		if (typeof source.pipe !== "function") throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
		this.source = source;
		this.base64Encoder = base64Encoder ?? toBase64$1;
		this.expectedChecksum = expectedChecksum;
		this.checksum = checksum;
		this.checksumSourceLocation = checksumSourceLocation;
		this.source.on("data", this.onSourceData);
		this.source.on("end", this.onSourceEnd);
		this.source.on("error", this.onSourceError);
		this.source.on("close", this.onSourceClose);
		this.source.pause();
	}
	onSourceData = (chunk) => {
		if (this.destroyed) return;
		try {
			this.checksum.update(chunk);
		} catch (e) {
			this.destroy(e);
			return;
		}
		if (!this.push(chunk)) this.source.pause();
	};
	onSourceEnd = async () => {
		if (this.destroyed) return;
		try {
			const digest = await this.checksum.digest();
			const received = this.base64Encoder(digest);
			if (this.expectedChecksum !== received) {
				this.destroy(/* @__PURE__ */ new Error(`Checksum mismatch: expected "${this.expectedChecksum}" but received "${received}" in response header "${this.checksumSourceLocation}".`));
				return;
			}
		} catch (e) {
			this.destroy(e);
			return;
		}
		this.push(null);
	};
	onSourceError = (error) => {
		this.destroy(error);
	};
	onSourceClose = () => {
		if (!this.destroyed && !this.source.readableEnded) this.destroy(/* @__PURE__ */ new Error("Connection lost or stream closed before all data was received."));
	};
	_read(_size) {
		this.source.resume();
	}
	_destroy(error, callback) {
		this.source?.removeListener("data", this.onSourceData);
		this.source?.removeListener("end", this.onSourceEnd);
		this.source?.removeListener("error", this.onSourceError);
		this.source?.removeListener("close", this.onSourceClose);
		this.source?.destroy();
		callback(error);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js
var isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
var isBlob = (blob) => {
	return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js
var fromUtf8 = (input) => new TextEncoder().encode(input);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/constants-for-browser.js
var chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
Object.entries(chars).reduce((acc, [i, c]) => {
	acc[c] = Number(i);
	return acc;
}, {});
var alphabetByValue = chars.split("");
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js
function toBase64(_input) {
	let input;
	if (typeof _input === "string") input = fromUtf8(_input);
	else input = _input;
	const isArrayLike = typeof input === "object" && typeof input.length === "number";
	const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
	if (!isArrayLike && !isUint8Array) throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
	let str = "";
	for (let i = 0; i < input.length; i += 3) {
		let bits = 0;
		let bitLength = 0;
		for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
			bits |= input[j] << (limit - j - 1) * 8;
			bitLength += 8;
		}
		const bitClusterCount = Math.ceil(bitLength / 6);
		bits <<= bitClusterCount * 6 - bitLength;
		for (let k = 1; k <= bitClusterCount; k++) {
			const offset = (bitClusterCount - k) * 6;
			str += alphabetByValue[(bits & 63 << offset) >> offset];
		}
		str += "==".slice(0, 4 - bitClusterCount);
	}
	return str;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/ChecksumStream.browser.js
var ReadableStreamRef = typeof ReadableStream === "function" ? ReadableStream : function() {};
var ChecksumStream = class extends ReadableStreamRef {};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/createChecksumStream.browser.js
var createChecksumStream$1 = ({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) => {
	if (!isReadableStream(source)) throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
	const encoder = base64Encoder ?? toBase64;
	if (typeof TransformStream !== "function") throw new Error("@smithy/util-stream: unable to instantiate ChecksumStream because API unavailable: ReadableStream/TransformStream.");
	const transform = new TransformStream({
		start() {},
		async transform(chunk, controller) {
			checksum.update(chunk);
			controller.enqueue(chunk);
		},
		async flush(controller) {
			const digest = await checksum.digest();
			const received = encoder(digest);
			if (expectedChecksum !== received) {
				const error = /* @__PURE__ */ new Error(`Checksum mismatch: expected "${expectedChecksum}" but received "${received}" in response header "${checksumSourceLocation}".`);
				controller.error(error);
			} else controller.terminate();
		}
	});
	source.pipeThrough(transform);
	const readable = transform.readable;
	Object.setPrototypeOf(readable, ChecksumStream.prototype);
	return readable;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/createChecksumStream.js
function createChecksumStream(init) {
	if (typeof ReadableStream === "function" && isReadableStream(init.source)) return createChecksumStream$1(init);
	return new ChecksumStream$1(init);
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/ByteArrayCollector.js
var ByteArrayCollector = class {
	allocByteArray;
	byteLength = 0;
	byteArrays = [];
	constructor(allocByteArray) {
		this.allocByteArray = allocByteArray;
	}
	push(byteArray) {
		this.byteArrays.push(byteArray);
		this.byteLength += byteArray.byteLength;
	}
	flush() {
		if (this.byteArrays.length === 1) {
			const bytes = this.byteArrays[0];
			this.reset();
			return bytes;
		}
		const aggregation = this.allocByteArray(this.byteLength);
		let cursor = 0;
		for (let i = 0; i < this.byteArrays.length; ++i) {
			const bytes = this.byteArrays[i];
			aggregation.set(bytes, cursor);
			cursor += bytes.byteLength;
		}
		this.reset();
		return aggregation;
	}
	reset() {
		this.byteArrays = [];
		this.byteLength = 0;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/createBufferedReadable.browser.js
function createBufferedReadableStream(upstream, size, logger) {
	const reader = upstream.getReader();
	let streamBufferingLoggedWarning = false;
	let bytesSeen = 0;
	const buffers = ["", new ByteArrayCollector((size) => new Uint8Array(size))];
	let mode = -1;
	const pull = async (controller) => {
		const { value, done } = await reader.read();
		const chunk = value;
		if (done) {
			if (mode !== -1) {
				const remainder = flush(buffers, mode);
				if (sizeOf(remainder) > 0) controller.enqueue(remainder);
			}
			controller.close();
		} else {
			const chunkMode = modeOf(chunk, false);
			if (mode !== chunkMode) {
				if (mode >= 0) controller.enqueue(flush(buffers, mode));
				mode = chunkMode;
			}
			if (mode === -1) {
				controller.enqueue(chunk);
				return;
			}
			const chunkSize = sizeOf(chunk);
			bytesSeen += chunkSize;
			const bufferSize = sizeOf(buffers[mode]);
			if (chunkSize >= size && bufferSize === 0) controller.enqueue(chunk);
			else {
				const newSize = merge(buffers, mode, chunk);
				if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
					streamBufferingLoggedWarning = true;
					logger?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
				}
				if (newSize >= size) controller.enqueue(flush(buffers, mode));
				else await pull(controller);
			}
		}
	};
	return new ReadableStream({ pull });
}
function merge(buffers, mode, chunk) {
	switch (mode) {
		case 0:
			buffers[0] += chunk;
			return sizeOf(buffers[0]);
		case 1:
		case 2:
			buffers[mode].push(chunk);
			return sizeOf(buffers[mode]);
	}
}
function flush(buffers, mode) {
	switch (mode) {
		case 0:
			const s = buffers[0];
			buffers[0] = "";
			return s;
		case 1:
		case 2: return buffers[mode].flush();
	}
	throw new Error(`@smithy/util-stream - invalid index ${mode} given to flush()`);
}
function sizeOf(chunk) {
	return chunk?.byteLength ?? chunk?.length ?? 0;
}
function modeOf(chunk, allowBuffer = true) {
	if (allowBuffer && typeof Buffer !== "undefined" && chunk instanceof Buffer) return 2;
	if (chunk instanceof Uint8Array) return 1;
	if (typeof chunk === "string") return 0;
	return -1;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/createBufferedReadable.js
function createBufferedReadable(upstream, size, logger) {
	if (isReadableStream(upstream)) return createBufferedReadableStream(upstream, size, logger);
	const downstream = new Readable({ read() {} });
	let streamBufferingLoggedWarning = false;
	let bytesSeen = 0;
	const buffers = [
		"",
		new ByteArrayCollector((size) => new Uint8Array(size)),
		new ByteArrayCollector((size) => Buffer.from(new Uint8Array(size)))
	];
	let mode = -1;
	upstream.on("data", (chunk) => {
		const chunkMode = modeOf(chunk, true);
		if (mode !== chunkMode) {
			if (mode >= 0) downstream.push(flush(buffers, mode));
			mode = chunkMode;
		}
		if (mode === -1) {
			downstream.push(chunk);
			return;
		}
		const chunkSize = sizeOf(chunk);
		bytesSeen += chunkSize;
		const bufferSize = sizeOf(buffers[mode]);
		if (chunkSize >= size && bufferSize === 0) downstream.push(chunk);
		else {
			const newSize = merge(buffers, mode, chunk);
			if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
				streamBufferingLoggedWarning = true;
				logger?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
			}
			if (newSize >= size) downstream.push(flush(buffers, mode));
		}
	});
	upstream.on("end", () => {
		if (mode !== -1) {
			const remainder = flush(buffers, mode);
			if (sizeOf(remainder) > 0) downstream.push(remainder);
		}
		downstream.push(null);
	});
	return downstream;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/getAwsChunkedEncodingStream.browser.js
var getAwsChunkedEncodingStream$1 = (readableStream, options) => {
	const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
	const checksumRequired = base64Encoder !== void 0 && bodyLengthChecker !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
	const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : void 0;
	const reader = readableStream.getReader();
	return new ReadableStream({ async pull(controller) {
		const { value, done } = await reader.read();
		if (done) {
			controller.enqueue(`0\r\n`);
			if (checksumRequired) {
				const checksum = base64Encoder(await digest);
				controller.enqueue(`${checksumLocationName}:${checksum}\r\n`);
				controller.enqueue(`\r\n`);
			}
			controller.close();
		} else controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r\n${value}\r\n`);
	} });
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/getAwsChunkedEncodingStream.js
function getAwsChunkedEncodingStream(stream, options) {
	const readable = stream;
	const readableStream = stream;
	if (isReadableStream(readableStream)) return getAwsChunkedEncodingStream$1(readableStream, options);
	const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
	const checksumRequired = base64Encoder !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
	const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readable) : void 0;
	const awsChunkedEncodingStream = new Readable({ read: () => {} });
	readable.on("data", (data) => {
		const length = bodyLengthChecker(data) || 0;
		if (length === 0) return;
		awsChunkedEncodingStream.push(`${length.toString(16)}\r\n`);
		awsChunkedEncodingStream.push(data);
		awsChunkedEncodingStream.push("\r\n");
	});
	readable.on("end", async () => {
		awsChunkedEncodingStream.push(`0\r\n`);
		if (checksumRequired) {
			const checksum = base64Encoder(await digest);
			awsChunkedEncodingStream.push(`${checksumLocationName}:${checksum}\r\n`);
			awsChunkedEncodingStream.push(`\r\n`);
		}
		awsChunkedEncodingStream.push(null);
	});
	return awsChunkedEncodingStream;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js
var toUtf8 = (input) => {
	if (typeof input === "string") return input;
	if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
	return new TextDecoder("utf-8").decode(input);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js
var streamCollector$1 = async (stream) => {
	if (isBlob(stream)) return collectBlob(stream);
	return collectReadableStream(stream);
};
async function collectBlob(blob) {
	return blob.arrayBuffer().then((ab) => new Uint8Array(ab));
}
async function collectReadableStream(stream) {
	const chunks = [];
	const reader = stream.getReader();
	let length = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (value) {
			chunks.push(value);
			length += value.length;
		}
		if (done) break;
	}
	return concatBytes(chunks, length);
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1 = "The stream has already been transformed.";
var sdkStreamMixin$1 = (stream) => {
	if (!isBlobInstance(stream) && !isReadableStream(stream)) {
		const name = stream?.__proto__?.constructor?.name || stream;
		throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
	}
	let transformed = false;
	const transformToByteArray = async () => {
		if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
		transformed = true;
		return await streamCollector$1(stream);
	};
	const blobToWebStream = (blob) => {
		if (typeof blob.stream !== "function") throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
		return blob.stream();
	};
	return Object.assign(stream, {
		transformToByteArray,
		transformToString: async (encoding) => {
			const buf = await transformToByteArray();
			if (encoding === "base64") return toBase64(buf);
			else if (encoding === "hex") return toHex(buf);
			else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") return toUtf8(buf);
			else if (typeof TextDecoder === "function") return new TextDecoder(encoding).decode(buf);
			else throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
		},
		transformToWebStream: () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
			transformed = true;
			if (isBlobInstance(stream)) return blobToWebStream(stream);
			else if (isReadableStream(stream)) return stream;
			else throw new Error(`Cannot transform payload to web stream, got ${stream}`);
		}
	});
};
var isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js
var streamCollector = (stream) => {
	if (isBlob(stream)) return collectBlob(stream);
	if (isReadableStream(stream)) return collectReadableStream(stream);
	return new Promise((resolve, reject) => {
		const collector = new Collector();
		const nodeStream = stream;
		nodeStream.pipe(collector);
		nodeStream.on("error", (err) => {
			collector.end();
			reject(err);
		});
		collector.on("error", reject);
		collector.on("finish", function() {
			resolve(concatBytes(this.bufferedBytes));
		});
	});
};
var Collector = class extends Writable {
	bufferedBytes = [];
	_write(chunk, encoding, callback) {
		this.bufferedBytes.push(chunk);
		callback();
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
var sdkStreamMixin = (stream) => {
	if (!(stream instanceof Readable)) try {
		return sdkStreamMixin$1(stream);
	} catch (ignored) {
		const name = stream?.__proto__?.constructor?.name || stream;
		throw new Error(`Unexpected stream implementation, expect Stream.Readable instance, got ${name}`);
	}
	let transformed = false;
	const transformToByteArray = async () => {
		if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
		transformed = true;
		return await streamCollector(stream);
	};
	return Object.assign(stream, {
		transformToByteArray,
		transformToString: async (encoding) => {
			const buf = await transformToByteArray();
			if (encoding === void 0 || Buffer.isEncoding(encoding)) return fromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength).toString(encoding);
			else return new TextDecoder(encoding).decode(buf);
		},
		transformToWebStream: () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
			if (stream.readableFlowing !== null) throw new Error("The stream has been consumed by other callbacks.");
			if (typeof Readable.toWeb !== "function") throw new Error("Readable.toWeb() is not supported. Please ensure a polyfill is available.");
			transformed = true;
			return Readable.toWeb(stream);
		}
	});
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/serde/index.js
var Uint8ArrayBlobAdapter = class extends bindUint8ArrayBlobAdapter(toUtf8$1, fromUtf8$1, toBase64$1, fromBase64) {};
var v4 = bindV4(getRandomValues);
var generateIdempotencyToken = v4;
//#endregion
export { isArrayBuffer as A, parseRfc3339DateTime as C, toBase64$1 as D, toUtf8$1 as E, fromUtf8$1 as O, parseEpochTimestamp as S, parseRfc7231DateTime as T, _parseRfc3339DateTimeWithOffset as _, streamCollector as a, LazyJsonString as b, createChecksumStream as c, fromHex as d, toHex as f, _parseEpochTimestamp as g, splitEvery as h, sdkStreamMixin as i, fromBase64 as k, toUint8Array as l, splitHeader as m, generateIdempotencyToken as n, getAwsChunkedEncodingStream as o, NumericValue as p, v4 as r, createBufferedReadable as s, Uint8ArrayBlobAdapter as t, calculateBodyLength as u, _parseRfc7231DateTime as v, parseRfc3339DateTimeWithOffset as w, dateToUtcString as x, quoteHeader as y };
