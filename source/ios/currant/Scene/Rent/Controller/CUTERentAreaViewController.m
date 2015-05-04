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
#import "FXFormViewController+CUTEForm.h"
#import "CUTERentTickePublisher.h"
#import "CUTENotificationKey.h"

@implementation CUTERentAreaViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"面积");
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
    CUTETicket *ticket = self.ticket;
    ticket.space = [CUTEArea areaWithValue:form.area unit:form.unit];
    if (ticket.rentType.slug && [ticket.rentType.slug hasSuffix:@":whole"]) {
        ticket.property.space = ticket.space;
    }
    else {
        ticket.property.space = nil;
    }

    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
}

@end
