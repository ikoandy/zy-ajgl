const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 创建测试案件
async function createTestCase() {
  try {
    const response = await axios.post('http://localhost:3000/api/cases', {
      title: '测试案件',
      type: '民事',
      client: '测试客户'
    });
    console.log('创建案件成功:', response.data);
    return response.data.data.id;
  } catch (error) {
    console.error('创建案件失败:', error.message);
    process.exit(1);
  }
}

// 测试文档上传
async function testDocumentUpload(caseId) {
  try {
    const formData = new FormData();
    formData.append('name', '测试文档');
    formData.append('file', fs.createReadStream('package.json'));

    const response = await axios.post(`http://localhost:3000/api/cases/${caseId}/documents`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('文档上传成功:', response.data);
  } catch (error) {
    console.error('文档上传失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

// 运行测试
async function runTest() {
  const caseId = await createTestCase();
  await testDocumentUpload(caseId);
  console.log('测试完成！');
  process.exit(0);
}

runTest();