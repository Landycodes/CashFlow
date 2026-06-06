import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Transactions } from "../../models/index.js";
import { Op } from "sequelize";
import { GATHERING_DATA } from "../../config/featureFlags.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function writeToJSONFile(filename, data, id = null) {
  if (!GATHERING_DATA) return;

  const filepath = path.join(__dirname, "../../../TESTDATA", filename);

  try {
    if (id !== null) {
      const affectedTransactionIds = data.map((t) => t.transaction_id);
      const affectedAccountIds = data.map((t) => t.account_id);

      data = await Transactions.findAll({
        where: {
          user_id: id,
          account_id: { [Op.in]: affectedAccountIds },
          transaction_id: { [Op.in]: affectedTransactionIds },
        },
      });
    }

    if (!data) return;

    const result = JSON.stringify(data, null, 2);
    await fs.writeFile(filepath, result);
    console.log(`Data written to ${filename}`);
  } catch (err) {
    console.error(`Failed to write ${filepath}:`, err);
  }
}
