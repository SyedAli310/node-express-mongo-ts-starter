import logColor from "cli-color"; // CLI color library for colored console output
import mongoose, { ConnectOptions, Mongoose } from "mongoose";

/**
 * Establishes a connection to a MongoDB database using Mongoose.
 *
 * - Configures Mongoose connection options such as connection pool size, timeouts, and IPv4 preference.
 * - Sets up event listeners for connection lifecycle events (`connected`, `error`, `disconnected`).
 * - Handles graceful shutdown on process termination (`SIGINT`), ensuring the database connection is closed.
 * - Logs connection status and errors to the console with colored output for better visibility.
 *
 * @param url - The MongoDB connection string URI.
 * @returns A promise that resolves to the Mongoose connection instance.
 * @throws Throws an error if the connection to MongoDB fails.
 */
const connectDB = async (url: string): Promise<Mongoose> => {
    try {
        mongoose.set("strictQuery", false);

        const connectionOptions: ConnectOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        } as ConnectOptions;

        const connection = await mongoose.connect(url, connectionOptions);

        mongoose.connection.on('connected', () => {
            console.log(logColor.green('MongoDB connected successfully'));
        });

        mongoose.connection.on('error', (err) => {
            console.error(logColor.red('MongoDB connection error:', err));
        });

        mongoose.connection.on('disconnected', () => {
            console.log(logColor.yellow('MongoDB disconnected'));
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log(logColor.blue('MongoDB connection closed through app termination'));
            process.exit(0);
        });

        return connection;
    } catch (error: any) {
        console.error(logColor.red('Failed to connect to MongoDB:'), logColor.cyan(error.message));
        throw error;
    }
};

export default connectDB;
