package com.mycompany.myapp.dto;

import com.mycompany.myapp.web.rest.vm.ManagedUserVM;

public class TeacherDto extends ManagedUserVM {
    private String phone;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public TeacherDto() {
    }
}
