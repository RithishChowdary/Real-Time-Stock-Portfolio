import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { uploadResearch } from "../services/adminResearchService";

export default function ResearchManagementPage() {

  const [stockId, setStockId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pdf, setPdf] = useState(null);

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      const request = {
        stockId,
        title,
        summary,
        sourceUrl,
      };

      await uploadResearch(
        request,
        pdf
      );

      alert("Research uploaded");

      setStockId("");
      setTitle("");
      setSummary("");
      setSourceUrl("");
      setPdf(null);

    } catch (error) {

      console.error(error);

      alert("Upload failed");
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Research Management
        </h1>

        <p className="text-slate-500">
          Upload stock research reports
        </p>
      </div>

      <Card>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="number"
            placeholder="Stock ID"
            value={stockId}
            onChange={(e) =>
              setStockId(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <textarea
            rows={5}
            placeholder="Summary"
            value={summary}
            onChange={(e) =>
              setSummary(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Source URL"
            value={sourceUrl}
            onChange={(e) =>
              setSourceUrl(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setPdf(e.target.files[0])
            }
          />

          <Button type="submit">
            Upload Research
          </Button>

        </form>

      </Card>

    </div>
  );
}