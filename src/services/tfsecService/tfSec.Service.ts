import { exec } from "child_process";
import logger from "../../utils/logger";

export const tfSecurityCheckService = async (): Promise<void> => {
    try {
        exec("tfsec", (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                // Log the error and stderr output if tfsec fails
                logger.error("Error occurred while running tfsec:", error);
                logger.error("tfsec stderr output:", stderr);
                return;
            }
            
            // Log the success message and stdout output if tfsec runs successfully
            if (stdout) {
                logger.info("tfsec completed successfully. Output:", stdout);
            }

            if (stderr) {
                // Log any non-error standard error output
                logger.warn("tfsec stderr (warnings/non-errors):", stderr);
            }
        });
    } catch (err) {
        // Log any unexpected errors
        logger.error("Unexpected error occurred in tfSecurityCheckService:", err);
    }
};
