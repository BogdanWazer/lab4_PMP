import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  Button,
  TextInput,
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

export default function App() {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [result, setResult] = useState('');
  const [authorInfo, setAuthorInfo] = useState('');
  const [showAuthorPhoto, setShowAuthorPhoto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tableStart, setTableStart] = useState('');
  const [tableEnd, setTableEnd] = useState('');
  const [tableStep, setTableStep] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);
  const authorImage = require('./assets/images/f1.png');

  useEffect(() => {
    readFromFile();
  }, []);

  const calculateF = () => {
    const parsedX = parseFloat(x);
    const parsedY = parseFloat(y);

    if (!isNaN(parsedX) && !isNaN(parsedY)) {
      const F =
        Math.sqrt(
          Math.pow(2 + parsedY, 2) + Math.pow(Math.sin(parsedY + 5), 1 / 7)
        ) /
        (Math.log(parsedX + 1) - Math.pow(parsedY, 3));

      if (!isNaN(F)) {
        setResult(`Результат: ${F}`);
        saveToFile(parsedX, parsedY, F);
      } else {
        setResult('Введіть коректні значення для розрахунку.');
      }
    } else {
      setResult('Невірні значення. Будь ласка, введіть числа.');
    }
  };

  const saveToFile = async (parsedX, parsedY, F) => {
    const content = `X: ${parsedX}, Y: ${parsedY}, F: ${F}\n`;
    const path = `${FileSystem.documentDirectory}results.txt`;

    try {
      await FileSystem.writeAsStringAsync(path, content, { append: true });
    } catch (error) {
      console.error('Помилка збереження в файл:', error);
    }
  };

  const readFromFile = async () => {
    const path = `${FileSystem.documentDirectory}results.txt`;

    try {
      const content = await FileSystem.readAsStringAsync(path);
      setFileContent(content);
    } catch (error) {
      console.error('Помилка читання з файлу:', error);
    }
  };

  const showAuthorInfo = () => {
    if (authorInfo || showAuthorPhoto) {
      setAuthorInfo('');
      setShowAuthorPhoto(false);
    } else {
      setAuthorInfo(
        'Автор: Кічак Богдан Володимирович, Факультет інформаційних технологій, 4 курс, КН22004бск'
      );
      setShowAuthorPhoto(true);
    }
  };

  const calculateTable = () => {
    const start = parseFloat(tableStart);
    const end = parseFloat(tableEnd);
    const step = parseFloat(tableStep);

    if (!isNaN(start) && !isNaN(end) && !isNaN(step) && step > 0) {
      let points = [];
      for (let i = start; i <= end; i += step) {
        const F =
          Math.sqrt(Math.pow(2 + i, 2) + Math.pow(Math.sin(i + 5), 1 / 7)) /
          (Math.log(i + 1) - Math.pow(i, 3));
        points.push({ x: i, y: F });
      }
      setGraphPoints(points);
      setResult('Таблиця обчислень збережена');
    } else {
      setResult('Невірні значення проміжку або кроку табуляції.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Розрахунок прикладу</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setX(text)}
        value={x}
        placeholder="Введіть значення x"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text) => setY(text)}
        value={y}
        placeholder="Введіть значення y"
        keyboardType="numeric"
      />
      <Button onPress={calculateF} title="Розрахувати" />
      <Button onPress={() => setShowModal(true)} title="Табуляція" />
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Табуляція</Text>
          <TextInput
            style={styles.modalInput}
            onChangeText={(text) => setTableStart(text)}
            value={tableStart}
            placeholder="Початок проміжку"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.modalInput}
            onChangeText={(text) => setTableEnd(text)}
            value={tableEnd}
            placeholder="Кінець проміжку"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.modalInput}
            onChangeText={(text) => setTableStep(text)}
            value={tableStep}
            placeholder="Крок табуляції"
            keyboardType="numeric"
          />
          <Button onPress={calculateTable} title="Обчислити таблицю" />
          <Text style={styles.modalResult}>{result}</Text>
          <Button onPress={() => setShowModal(false)} title="Закрити таблицю" />
        </View>
      </Modal>
      <Text style={styles.result}>{result}</Text>
      <Text style={styles.authorInfo}>{authorInfo}</Text>
      {showAuthorPhoto && (
        <Image source={authorImage} style={styles.authorImage} />
      )}
      <Button onPress={showAuthorInfo} title="Показати інформацію про автора" />
      <Button onPress={readFromFile} title="Прочитати з файлу" />
      <Text>{fileContent}</Text>
      <Svg height="400" width="400">
        {graphPoints.map((point, index) => (
          <Circle
            key={index}
            cx={(point.x - parseFloat(tableStart)) * 30}
            cy={300 - point.y * 30}
            r="3"
            fill="red"
          />
        ))}
        {graphPoints.map((point, index) => {
          if (index < graphPoints.length - 1) {
            const nextPoint = graphPoints[index + 1];
            return (
              <Line
                key={index}
                x1={(point.x - parseFloat(tableStart)) * 30}
                y1={300 - point.y * 30}
                x2={(nextPoint.x - parseFloat(tableStart)) * 30}
                y2={300 - nextPoint.y * 30}
                stroke="black"
                strokeWidth="2"
              />
            );
          }
        })}
        <Line
          x1="0"
          y1="300"
          x2="400"
          y2="300"
          stroke="black"
          strokeWidth="2"
        />
        <Line x1="0" y1="300" x2="0" y2="0" stroke="black" strokeWidth="2" />
        {[...Array(11).keys()].map((num) => (
          <Text
            key={num}
            x={num * 30}
            y="320"
            fontSize="12"
            textAnchor="middle">
            {parseFloat(tableStart) + num}
          </Text>
        ))}
        {[...Array(7).keys()].map((num) => (
          <Text
            key={num}
            x="-20"
            y={300 - num * 50}
            fontSize="12"
            textAnchor="end">
            {(num * 50).toFixed(2)}
          </Text>
        ))}
        <SvgText x="380" y="320" fontSize="12">
          X
        </SvgText>
        <SvgText x="-20" y="280" fontSize="12">
          Y
        </SvgText>
      </Svg>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
  },
  authorInfo: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  },
  authorImage: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 100,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalResult: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'left',
  },
});
