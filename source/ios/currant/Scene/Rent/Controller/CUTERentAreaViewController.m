//
//  CUTERentAreaViewController.m
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAreaViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEAreaForm.h"
#import "CUTEDataManager.h"
#import "CUTEAreaForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"
#import "CUTEModelEditingListener.h"

@implementation CUTERentAreaViewController

- (CUTEAreaForm *)form {
    return (CUTEAreaForm *)self.formController.form;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"面积");
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    if (self.updateRentAreaCompletion) {
        self.updateRentAreaCompletion();
    }
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
    [self updateTicket];
}

- (void)onAreaEdit:(id)sender {
    [self updateTicket];
}

- (void)updateTicket {
    CUTEAreaForm *form = (CUTEAreaForm *)self.formController.form;
    CUTETicket *ticket = self.form.ticket;
    CUTEArea *area = [CUTEArea areaWithValue:form.area unit:form.unit];
    if (ticket.rentType.slug && [ticket.rentType.slug hasSuffix:@":whole"]) {
        [form syncTicketWithUpdateInfo:
                            @{@"space": area, @"property.space": area}];
    }
    else {
        [form syncTicketWithUpdateInfo:
                            @{@"space": area, @"property.space": [NSNull null]}];
    }
}

@end
