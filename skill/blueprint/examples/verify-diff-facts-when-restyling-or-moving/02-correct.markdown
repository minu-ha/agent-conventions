## 옮기기 커밋

- 절을 줄째 옮김. 옛 줄 41, 새 판에서 41 전부 한 번씩

## 고치기 커밋

```sh
git show HEAD~1:content/public/screen/orders.md | grep -oE "[a-z-]+\.tsx?:[0-9]+|[0-9a-f]{8}|\"[^\"]+\"" | sort -u > old.txt
grep -oE "[a-z-]+\.tsx?:[0-9]+|[0-9a-f]{8}|\"[^\"]+\"" content/public/screen/orders.md | sort -u > new.txt
comm -23 old.txt new.txt
```

- 빠진 것: `"Index B 익년"` 하나. 10-07 결정으로 일부러 뺌
