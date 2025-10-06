import pandas as pd

df = pd.read_parquet("green_tripdata_2025-01.parquet")
print(df.columns)
